import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class GeneratedDocsGateTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.root = Path(directory.name)
        scripts = self.root / "scripts"
        scripts.mkdir()
        self.gate = scripts / "gate-docs-sync.py"
        shutil.copy(ROOT / "scripts" / self.gate.name, self.gate)
        # Each fake generator writes the same outputs as its real counterpart.
        for script, outputs in [
            ("generate-llms-txt.py", ["public/llms.txt", "public/llms-core.txt"]),
            ("generate-bpm-components-json.py", ["lib/generated/bpm-components.json"]),
            ("generate-mcp-registry.mjs", ["lib/generated/mcp-registry.json"]),
            ("generate-component-examples.mjs", ["lib/generated/component-examples.json"]),
        ]:
            code = []
            for output in outputs:
                path = self.root / output
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("current")
                if script.endswith(".py"):
                    code.append(f"from pathlib import Path\nPath({output!r}).write_text('current')")
                else:
                    code.append(f"await (await import('node:fs/promises')).writeFile('{output}', 'current')")
            (scripts / script).write_text("\n".join(code))

    def run_gate(self):
        return subprocess.run([sys.executable, self.gate], cwd=self.root, capture_output=True, text=True)

    def test_clean_chain_passes(self):
        result = self.run_gate()
        self.assertEqual(result.returncode, 0, result.stdout)

    def test_missing_output_fails_and_stays_absent(self):
        path = self.root / "lib/generated/bpm-components.json"
        path.unlink()
        self.assertNotEqual(self.run_gate().returncode, 0)
        self.assertFalse(path.exists())

    def test_secondary_outputs_are_checked_and_restored(self):
        for name in ["public/llms-core.txt", "lib/generated/component-examples.json"]:
            with self.subTest(name=name):
                path = self.root / name
                path.write_bytes(b"stale\r\n")
                result = self.run_gate()
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertIn(name, result.stdout)
                self.assertEqual(path.read_bytes(), b"stale\r\n")
                path.write_text("current")
