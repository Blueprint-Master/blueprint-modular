/**
 * Versions par surface livrable — source unique : lib/generated/versions.json,
 * dérivé au build depuis pyproject.toml (Python), packages/core/package.json (npm)
 * et package.json (app). Aucune version codée en dur ailleurs.
 *
 * - APP_VERSION    : version interne de l'application Next.js (footer app, cache-buster).
 * - PYTHON_VERSION : paquet PyPI « blueprint-modular ».
 * - CORE_VERSION   : paquet npm « @blueprint-modular/core ».
 */
import versions from "./generated/versions.json";

export const APP_VERSION = versions.app;
export const PYTHON_VERSION = versions.python;
export const CORE_VERSION = versions.core;
