#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       BUILD — Discord Overlay            ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé."
    echo "Téléchargez-le sur https://nodejs.org"
    exit 1
fi

echo "[OK] Node.js $(node --version) détecté"
echo ""

# Installer les dépendances
echo "[1/2] Installation des dépendances..."
npm install || { echo "[ERREUR] npm install échoué"; exit 1; }

echo ""
echo "[2/2] Construction du package..."

# Détecter l'OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    npm run dist-mac
else
    npm run dist-linux
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build réussi ! Fichiers dans le dossier dist/"
    ls dist/
else
    echo "[ERREUR] Le build a échoué."
    exit 1
fi
