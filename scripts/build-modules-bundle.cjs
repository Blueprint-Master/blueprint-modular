#!/usr/bin/env node
// Retain the Node entry point used by existing deployment scripts.
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const python = process.platform === "win32" ? "python" : "python3";
const result = spawnSync(python, [path.join(__dirname, "build-modules-bundle.py"), ...process.argv.slice(2)], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
