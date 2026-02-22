# Corriger le 403 sur le logo et les images (img/)

Si le logo ou les images dans `/img/` renvoient **403 Forbidden**, le serveur web (Nginx/www-data) n’a pas les droits de lecture sur ces fichiers.

## Après déploiement avec le script PowerShell (depuis Windows)

Sur le serveur, exécuter une fois :

```bash
# Vitrine (blueprint-modular.com)
sudo chmod 755 /var/www/blueprint-modular/img
sudo chmod 644 /var/www/blueprint-modular/img/*

# Si vous avez aussi la doc sur le même serveur (docs.blueprint-modular.com)
sudo chmod 755 /var/www/blueprint-modular-docs/img
sudo chmod 644 /var/www/blueprint-modular-docs/img/*
```

Puis recharger la page (vider le cache si besoin).

## Vérification

- `ls -la /var/www/blueprint-modular/img` → le dossier doit être `drwxr-xr-x`, les fichiers `-rw-r--r--` (ou au moins lisibles par « others »).
- L’utilisateur Nginx (souvent `www-data`) doit pouvoir lire ces fichiers (droits 644 + dossier 755 en général suffisent).
