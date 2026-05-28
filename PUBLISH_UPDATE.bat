@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Discord Overlay - Publier une mise a jour

echo.
echo ==========================================
echo   PUBLIER UNE MISE A JOUR
echo ==========================================
echo.

:: -------------------------------------------------
:: Verifier Node.js
:: -------------------------------------------------

where node >nul 2>&1

if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    pause
    exit /b 1
)

echo [OK] Node.js detecte.
echo.

:: -------------------------------------------------
:: Verifier GH_TOKEN
:: -------------------------------------------------

if "%GH_TOKEN%"=="" (

    echo [ERREUR] GH_TOKEN non defini.
    echo.
    echo Cree un token GitHub ici :
    echo https://github.com/settings/tokens/new
    echo.
    echo Permissions necessaires :
    echo - repo
    echo.
    echo Ensuite :
    echo Variables d'environnement Windows
    echo Ajouter :
    echo GH_TOKEN = ton_token
    echo.

    pause
    exit /b 1
)

echo [OK] GH_TOKEN detecte.
echo.

:: -------------------------------------------------
:: Lire version actuelle
:: -------------------------------------------------

for /f "tokens=2 delims=:, " %%v in ('findstr /i "\"version\"" package.json') do (
    set RAW_VER=%%v
    goto :versionok
)

:versionok

set RAW_VER=%RAW_VER:"=%

echo Version actuelle : %RAW_VER%
echo.

:: -------------------------------------------------
:: Nouvelle version
:: -------------------------------------------------

set /p NEW_VER=Nouvelle version (ex: 1.1.0) :

if "%NEW_VER%"=="" (
    echo.
    echo [ERREUR] Version invalide.
    pause
    exit /b 1
)

echo.
echo Nouvelle version : v%NEW_VER%
echo.

:: -------------------------------------------------
:: Modifier package.json
:: -------------------------------------------------

echo Mise a jour de package.json...

powershell -ExecutionPolicy Bypass -Command ^
"(Get-Content package.json -Raw) -replace '\"version\":\s*\"%RAW_VER%\"','\"version\": \"%NEW_VER%\"' | Set-Content package.json -Encoding UTF8"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] Impossible de modifier package.json.
    pause
    exit /b 1
)

echo [OK] package.json mis a jour.
echo.

:: -------------------------------------------------
:: Nettoyer dist
:: -------------------------------------------------

if exist dist (
    echo Nettoyage de dist...
    rmdir /s /q dist
)

:: -------------------------------------------------
:: Installer dependances
:: -------------------------------------------------

echo Installation des dependances...
call npm install

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERREUR] npm install a echoue.
    pause
    exit /b 1
)

echo [OK] Dependances installees.
echo.

:: -------------------------------------------------
:: Build + publish
:: -------------------------------------------------

echo ==========================================
echo Build et publication GitHub
echo ==========================================
echo.
echo Cela peut prendre quelques minutes...
echo.

call npm run publish

if %ERRORLEVEL% neq 0 (

    echo.
    echo ==========================================
    echo             ERREUR
    echo ==========================================
    echo.
    echo La publication a echoue.
    echo.
    echo Verifie :
    echo - repository dans package.json
    echo - GH_TOKEN
    echo - connexion internet
    echo - acces GitHub
    echo.

    pause
    exit /b 1
)

echo.
echo ==========================================
echo      MISE A JOUR PUBLIEE
echo ==========================================
echo.

echo Version publiee : v%NEW_VER%
echo.

echo Les utilisateurs recevront
echo automatiquement la mise a jour
echo au prochain lancement.
echo.

pause