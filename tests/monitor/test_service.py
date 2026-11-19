import io
import json
import os
import unittest
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch

import httpx
from fastapi.testclient import TestClient
from pptx import Presentation

from deploy.prompteur.main import app

API = "/api/prompteur/"
KEY = {"X-Anthropic-API-Key": "recipe-only"}


def presentation(title):
    deck = Presentation()
    deck.core_properties.title = title
    slide = deck.slides.add_slide(deck.slide_layouts[1])
    slide.shapes.title.text = title
    slide.placeholders[1].text = "Avancement\nKPI: 12 lots"
    slide.notes_slide.notes_text_frame.text = "Note privée de recette"
    file = io.BytesIO()
    deck.save(file)
    return file.getvalue()


class MonitorService(unittest.TestCase):
    def test_two_powerpoint_imports_return_their_own_notes_and_metrics(self):
        def run(title):
            with TestClient(app) as client:
                res = client.post(API + "import-pptx", files={"file": ("recette.pptx", presentation(title))})
                self.assertEqual(res.status_code, 200, res.text)
                slide = res.json()["slides"][0]
                self.assertEqual(slide["title"], title)
                self.assertEqual(slide["notes"], "Note privée de recette")
                self.assertEqual(slide["kpis"], ["12 lots"])
        with ThreadPoolExecutor(2) as executor:
            list(executor.map(run, ["Recette A", "Recette B"]))

    def test_import_and_input_errors(self):
        with TestClient(app) as client:
            self.assertEqual(client.get(API + "health").json()["status"], "ok")
            self.assertEqual(client.post(API + "import-pptx", files={"file": ("vide.pptx", b"")}).status_code, 422)
            self.assertEqual(client.post(API + "translate", json={"text": "Bonjour"}).status_code, 401)
            self.assertEqual(client.post(API + "translate", json={"text": " "}, headers=KEY).status_code, 422)

    def test_three_ai_commands_stream_to_completion_with_isolated_provider(self):
        slide = {"id": 1, "title": "Essai", "script": "Un lot"}
        commands = {"translate": {"text": "Un lot"}, "suggest-answer": {"question": "Combien ?", "slide": slide},
                    "summarize": {"presentation_title": "Essai", "slides": [slide], "questions_logged": []}}
        content = "Texte accentué\nChemin littéral \\n"
        def provider(request):
            body = json.loads(request.content)
            self.assertEqual(request.headers["x-api-key"], "recipe-only")
            self.assertEqual(body["model"], "recette-isolee")
            self.assertTrue(body["stream"])
            event = {"type": "content_block_delta", "delta": {"type": "text_delta", "text": content}}
            return httpx.Response(200, text=f"data: {json.dumps(event)}\n\ndata: " + '{"type":"message_stop"}\n\n')

        factory = httpx.AsyncClient
        def local_client(**kwargs):
            return factory(transport=httpx.MockTransport(provider), **kwargs)
        with TestClient(app) as client, patch.dict(os.environ, PROMPTEUR_MODEL="recette-isolee"), \
             patch("deploy.prompteur.main.httpx.AsyncClient", side_effect=local_client):
            for action, data in commands.items():
                response = client.post(API + action, json=data, headers=KEY)
                self.assertEqual(response.status_code, 200)
                self.assertIn(json.dumps(content, ensure_ascii=False), response.text)
                self.assertIn("data: [DONE]", response.text)
