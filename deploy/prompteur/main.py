"""ASGI service for the Modular Monitor application."""
import json
import os
from pathlib import Path
from typing import Annotated, Literal
from zipfile import BadZipFile, ZipFile

import httpx
from fastapi import FastAPI, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from lxml.etree import XMLSyntaxError
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pydantic import BaseModel, Field, StringConstraints

app = FastAPI(title="Blueprint Monitor")
PREFIX = "/api/prompteur"
MAX_FILE = 100 * 1024 * 1024
ApiKey = Annotated[str | None, Header(alias="X-Anthropic-API-Key")]
Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100_000)]


class Slide(BaseModel):
    id: int
    title: Text
    script: str = Field(max_length=100_000)
    notes: str | None = Field(None, max_length=100_000)
    kpis: list[Text] = Field(default_factory=list, max_length=200)


class Question(BaseModel):
    question: Text
    answer: Text
    slide_title: Text


class Suggestion(BaseModel):
    question: Text
    slide: Slide
    lang: Literal["fr", "en"] = "fr"


class Translation(BaseModel):
    text: Text
    direction: Literal["fr_to_en", "en_to_fr"] = "fr_to_en"


class Summary(BaseModel):
    presentation_title: Text
    slides: list[Slide] = Field(min_length=1, max_length=1000)
    questions_logged: list[Question] = Field(default_factory=list, max_length=2000)


@app.get(PREFIX + "/health")
def health(key: ApiKey = None):
    return {"status": "ok", "module": "monitor", "anthropic_key_set": bool(key and key.strip())}


def shape_text(shapes):
    for shape in shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from shape_text(shape.shapes)
        elif shape.has_table:
            for row in shape.table.rows:
                yield " | ".join(cell.text.strip() for cell in row.cells)
        elif shape.has_text_frame and shape.text.strip():
            yield shape.text.strip()


@app.post(PREFIX + "/import-pptx")
def import_pptx(file: UploadFile):
    filename = Path(file.filename or "")
    if filename.suffix.lower() != ".pptx":
        raise HTTPException(422, "Un fichier .pptx est requis.")
    if file.size is None or file.size > MAX_FILE:
        raise HTTPException(413, "La limite est de 100 Mio.")
    try:
        with ZipFile(file.file) as archive:
            entries = archive.infolist()
            if len(entries) > 20000 or sum(item.file_size for item in entries) > 4 * MAX_FILE:
                raise HTTPException(413, "Présentation décompressée trop volumineuse.")
        file.file.seek(0)
        deck = Presentation(file.file)
        if not 1 <= len(deck.slides) <= 1000:
            raise HTTPException(422, "La présentation doit contenir entre 1 et 1000 diapositives.")
        slides = []
        for i, slide in enumerate(deck.slides, 1):
            title = slide.shapes.title
            body = shape_text(s for s in slide.shapes if title is None or s.shape_id != title.shape_id)
            script = "\n\n".join(body)
            notes = slide.notes_slide.notes_text_frame if slide.has_notes_slide else None
            kpis = [line.partition(":")[2].strip() for line in script.splitlines()
                    if line.upper().startswith("KPI:") and line.partition(":")[2].strip()]
            slides.append({"id": i, "title": (title.text.strip() if title is not None else "") or f"Slide {i}",
                           "script": script, "notes": notes.text.strip() if notes else "", "kpis": kpis})
        return {"title": deck.core_properties.title.strip() or filename.stem,
                "slide_count": len(slides), "slides": slides}
    except (BadZipFile, ValueError, KeyError, XMLSyntaxError, OSError) as error:
        raise HTTPException(422, "Présentation PowerPoint illisible.") from error


def stream_text(instruction: str, data: BaseModel, key: str | None):
    if not key or not key.strip():
        raise HTTPException(401, "Renseignez votre clé API Claude.")
    model = os.getenv("PROMPTEUR_MODEL")
    if not model:
        raise HTTPException(503, "Le modèle du prompteur doit être configuré.")
    serialized = data.model_dump_json()
    if len(serialized) > 400_000:
        raise HTTPException(413, "Le texte de la séance est trop long.")
    async def events():
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                async with client.stream("POST", "https://api.anthropic.com/v1/messages",
                                         headers={"x-api-key": key.strip(), "anthropic-version": "2023-06-01"},
                                         json={"model": model, "max_tokens": 2048, "stream": True,
                                               "system": instruction, "messages": [{"role": "user", "content": serialized}]}) as response:
                    if response.is_error:
                        yield f"data: [ERROR] Claude HTTP {response.status_code}\n\n"
                        return
                    async for line in response.aiter_lines():
                        if not line.startswith("data:"):
                            continue
                        event = json.loads(line[5:])
                        if event["type"] == "message_stop":
                            yield "data: [DONE]\n\n"
                            return
                        if event["type"] == "error":
                            break
                        delta = event.get("delta", {})
                        if event["type"] == "content_block_delta" and delta.get("type") == "text_delta":
                            # Explicit JSON framing preserves newlines and literal backslashes.
                            yield "event: text\ndata: " + json.dumps(delta["text"], ensure_ascii=False) + "\n\n"
        except (httpx.HTTPError, ValueError, KeyError):
            pass
        yield "data: [ERROR] Réponse du fournisseur interrompue.\n\n"
    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"})


@app.post(PREFIX + "/suggest-answer")
def suggest(data: Suggestion, key: ApiKey = None):
    return stream_text(f"Answer the audience question in {data.lang} using the supplied slide. Flag missing facts.", data, key)


@app.post(PREFIX + "/translate")
def translate(data: Translation, key: ApiKey = None):
    language = "English" if data.direction == "fr_to_en" else "French"
    return stream_text(f"Translate the supplied text to {language}. Return only the translation.", data, key)


@app.post(PREFIX + "/summarize")
def summarize(data: Summary, key: ApiKey = None):
    return stream_text("Summarize this presentation in its language. Use the supplied slides and actual logged questions. "
                       "Distinguish proposals from decisions. Include only documented follow-up actions.", data, key)
