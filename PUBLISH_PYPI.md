# Publier blueprint-modular sur PyPI

## Vérifier que le nom est disponible

```bash
pip index versions blueprint-modular 2>/dev/null || echo "Nom disponible"
```

## Test sur TestPyPI (recommandé)

```bash
# Upload
python -m twine upload --repository testpypi dist/*
# Username: __token__
# Password: (votre token TestPyPI, préfixe pypi-)

# Tester l'installation depuis TestPyPI
pip install --index-url https://test.pypi.org/simple/ blueprint-modular
bpm --version
# → blueprint-modular 0.1.0
```

## Publication sur PyPI

1. Créer un compte sur https://pypi.org/account/register/ (2FA obligatoire).
2. Générer un API token : https://pypi.org/manage/account/token/
3. Upload :

```bash
python -m twine upload dist/*
# Username: __token__
# Password: (votre token PyPI)
```

## Vérification après publication

```bash
pip install blueprint-modular
bpm --version
bpm --help
bpm init --name test-app
cd test-app
bpm run app.py
```

Page du projet : https://pypi.org/project/blueprint-modular/

## Mise à jour de version

Modifier la version dans :

- `pyproject.toml` : `version = "0.1.1"`
- `bpm/__init__.py` : `__version__ = "0.1.1"`
- `bpm/cli.py` : utilise `__version__` de `bpm`, pas de doublon

Puis :

```bash
python -m build
python -m twine upload dist/*
```

PyPI n'accepte pas d'écraser une version existante : toujours incrémenter avant de re-publier.
