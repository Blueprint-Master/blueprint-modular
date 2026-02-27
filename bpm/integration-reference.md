# Blueprint Modular — Référence d'intégration

Ce fichier est inclus dans le package PyPI `blueprint-modular`. Il indique où trouver la **référence complète** pour intégrer tous les modules et tous les composants BPM dans une autre application.

## Documentation en ligne (tout le monde)

**URL :** https://docs.blueprint-modular.com/get-started/integration.html

Cette page contient :
- La liste de tous les **modules** (asset-manager, wiki, documents, contracts, newsletter, ia, etc.)
- Les **préfixes API** (auth, wiki, documents, contracts, newsletter, ai, asset-manager, settings, etc.)
- La liste des **composants BPM** (Panel, Button, Table, Badge, Tabs, Modal, etc.)
- Les instructions pour une **intégration par copie/sync** ou par **appels API**

Aucun accès au dépôt Git n’est nécessaire pour consulter cette page.

## Fichier manifest.json (dans ce package)

Le fichier `manifest.json` (à côté de ce fichier dans le package) contient au format JSON :
- `integration_doc_url` : l’URL de la page ci-dessus
- `modules` : liste des noms de modules
- `components` : liste des noms de composants exportés

Exemple d’utilisation en Python après `pip install blueprint-modular` :

```python
import bpm
import json
from pathlib import Path

pkg_dir = Path(bpm.__path__[0])
with open(pkg_dir / "manifest.json", encoding="utf-8") as f:
    manifest = json.load(f)
print(manifest["integration_doc_url"])  # → https://docs.blueprint-modular.com/get-started/integration.html
print(manifest["modules"][:5])          # → ['asset-manager', 'auth', 'wiki', ...]
```

## Dépôt source (accès restreint)

La référence détaillée (chemins exacts, lib, Prisma, procédure de copie complète) se trouve dans le fichier `INTEGRATION.md` à la racine du dépôt Blueprint Modular. Ce dépôt n’est pas public ; l’accès est réservé aux personnes autorisées.
