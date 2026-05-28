@echo off
chcp 65001 >nul
title Discord Overlay — Build

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║       BUILD — Discord Overlay            ║
echo  ║  Creation de l'installeur Windows (.exe) ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ── Vérifier Node.js ────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo  [ERREUR] Node.js n'est pas installe !
    echo.
    echo  Telechargez-le ici : https://nodejs.org
    echo  Choisissez la version LTS, installez-la, puis relancez ce script.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js detecte : %NODE_VER%
echo.

:: ── Installer les dépendances ────────────────────────────────
echo  [1/2] Installation des dependances (peut prendre 2-5 min)...
echo        (Electron doit etre telecharge ~100 MB)
echo.
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [ERREUR] L'installation a echoue.
    echo  Verifiez votre connexion internet et reessayez.
    pause
    exit /b 1
)

echo.
echo  [OK] Dependances installees.
echo.

:: ── Builder l'exe ────────────────────────────────────────────
echo  [2/2] Construction de l'installeur .exe...
echo.
call npm run dist
if %ERRORLEVEL% neq 0 (
    echo.
    echo  [ERREUR] Le build a echoue. Consultez les messages ci-dessus.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║  BUILD REUSSI !                          ║
echo  ╚══════════════════════════════════════════╝
echo.
echo  Les fichiers sont dans le dossier : dist\
echo.
echo   - "Discord Overlay Setup.exe"  → installeur pour tes amis
echo   - "Discord Overlay.exe"        → version portable (sans installation)
echo.
echo  Envoie l'un de ces fichiers a tes amis !
echo.

:: Ouvrir le dossier dist automatiquement
if exist dist\ (
    explorer dist\
)

pause
