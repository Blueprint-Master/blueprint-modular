#!/usr/bin/env bash
# Déploiement sur le VPS. À lancer depuis la racine du projet sur le VPS (après git clone).
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Fichier .env manquant. Copie de .env.example vers .env."
  cp .env.example .env
  echo "Édite .env (POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_*) puis relance ce script."
  exit 1
fi

echo "Build et démarrage des conteneurs..."
docker-compose up -d --build

echo "Attente du démarrage de PostgreSQL (15 s)..."
sleep 15

echo "Application des migrations Prisma..."
docker-compose --profile tools run --rm migrate

echo "Déploiement terminé. App sur le port 3000."
echo "Pense à mettre Nginx (ou autre) en reverse proxy et à configurer NEXTAUTH_URL + callback Google."
