from concurrent.futures import ThreadPoolExecutor, wait
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Event
import json
import sys
import types
import unittest
from unittest.mock import patch

import bpm
from bpm import server


class RuntimeConcurrencyTest(unittest.TestCase):
    def test_action_during_render_is_consumed_by_the_next_run(self):
        with TemporaryDirectory() as directory:
            app = Path(directory, "app.py")
            app.write_text(
                "import bpm, runtime_sync\n"
                "bpm.write(bpm.button('Valider', key='commande'))\n"
                "runtime_sync.started.set()\n"
                "assert runtime_sync.release.wait(5)\n"
            )
            sync = types.SimpleNamespace(started=Event(), release=Event())
            attempting = Event()

            def click():
                attempting.set()
                server._apply_action("button_click", {"key": "commande"})

            def poll():
                handler = object.__new__(server.BPMHandler)
                handler.path = "/api/nodes"
                handler.script_path = str(app)
                with patch.object(handler, "_send") as send:
                    handler.do_GET()
                status, _, body = send.call_args.args
                self.assertEqual(status, 200, body)
                return json.loads(body)["nodes"][1]["props"]["text"]

            with patch.dict(sys.modules, runtime_sync=sync), ThreadPoolExecutor(2) as pool:
                rendering = pool.submit(poll)
                try:
                    self.assertTrue(sync.started.wait(5))
                    action = pool.submit(click)
                    self.assertTrue(attempting.wait(5))
                    # An action must not modify this run's shared state halfway through.
                    completed, _ = wait([action], timeout=0.2)
                finally:
                    sync.release.set()
                action.result(5)
                self.assertEqual(rendering.result(5), "False")
                self.assertEqual(poll(), "True")
                self.assertEqual(poll(), "False")
                self.assertFalse(completed)

    def test_failed_script_preserves_existing_import_path(self):
        with TemporaryDirectory() as directory:
            script = Path(directory, "app.py")
            script.write_text("raise ValueError('fixture')")
            with patch.object(sys, "path", [directory, *sys.path]):
                before = list(sys.path)
                with self.assertRaises(ValueError):
                    server._run_script(str(script))
                self.assertEqual(sys.path, before)
