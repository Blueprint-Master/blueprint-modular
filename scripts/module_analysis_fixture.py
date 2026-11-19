"""Loopback model and document fixtures for the installed Modules application."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
import json
from threading import Thread
from urllib.error import HTTPError
from uuid import uuid4
from zipfile import ZipFile

TEXT = "Recette Atlas : contrat pour la livraison de mobilier."


class Model(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_POST(self):
        payload = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if self.path == "/api/embeddings":
            response = {"embedding": [0.25, 0.75]}
        elif self.path == "/api/chat":
            prompt = payload["messages"][-1]["content"]
            if TEXT not in prompt:
                self.send_error(422)
                return
            if "executive_summary" in prompt:
                result = {"executive_summary": TEXT, "supplier_name": "Atlas"}
            else:
                result = {"supplier": "Atlas", "summary": TEXT, "key_points": ["Mobilier"]}
            response = {"message": {"content": json.dumps(result)}, "done": True}
        else:
            self.send_error(404)
            return
        body = json.dumps(response).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


@contextmanager
def model_service():
    with ThreadingHTTPServer(("127.0.0.1", 0), Model) as server:
        worker = Thread(target=server.serve_forever, daemon=True)
        worker.start()
        try:
            yield f"http://127.0.0.1:{server.server_port}"
        finally:
            server.shutdown()
            worker.join()


def word_document():
    out = BytesIO()
    with ZipFile(out, "w") as doc:
        doc.writestr("[Content_Types].xml", '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
        doc.writestr("word/document.xml", '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>' + TEXT + '</w:t></w:r></w:p></w:body></w:document>')
    return out.getvalue()


def upload(read, path, name, mime, data):
    boundary = uuid4().hex
    header = f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: {mime}\r\n\r\n'.encode()
    return json.loads(read(path, data=header + data + f"\r\n--{boundary}--\r\n".encode(), mime="multipart/form-data; boundary=" + boundary))


def create_records(read):
    doc = upload(read, "/api/documents", "atlas.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", word_document())
    assert doc["analysisStatus"] == "done" and doc["summary"] == TEXT, doc["analysisStatus"]
    invalid = upload(read, "/api/documents", "unreadable.pdf", "application/pdf", b"not a PDF")
    assert invalid["analysisStatus"] == "error", invalid["analysisStatus"]

    def send(_):
        try:
            return upload(read, "/api/contracts", "atlas.txt", "text/plain", TEXT.encode())
        except HTTPError as exc:
            if exc.code != 409:
                raise
            return None

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(send, range(2)))
    records = [result for result in results if result is not None]
    assert len(records) == 1, results
    contract = records[0]
    assert contract["status"] == "done" and contract["extractedData"]["executive_summary"] == TEXT
    assert "overall_risk_level" not in contract["extractedData"]
    return doc["id"], contract["id"]


def verify_after_restart(read, ids):
    document, contract = ids
    assert json.loads(read(f"/api/documents/{document}"))["summary"] == TEXT
    resumed = json.loads(read(f"/api/contracts/{contract}/reanalyze", data=b"", mime="application/json"))
    assert resumed["status"] == "done" and resumed["extractedData"]["supplier_name"] == "Atlas"
    print("DOCX extraction, duplicate contract imports and reanalysis after restart OK")
