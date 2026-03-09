#!/bin/bash
set -e
cd /home/ubuntu/blueprint-modular
git pull origin master
npm ci
rm -rf .next
npm run build
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/public
pm2 restart blueprint-app && pm2 save
echo "Deploy OK"
