# Discord Overlay 🎮

Diffusez des images, vidéos et textes sur l'écran de vos amis via Discord.

---

## 🚀 Créer l'installeur (.exe) pour tes amis

> Tu as besoin de **Node.js** installé : https://nodejs.org (version LTS)

### Windows
Double-clique sur **`BUILD_WIN.bat`**

C'est tout. Le script :
1. Installe automatiquement les dépendances (~100 MB, Electron)
2. Compile l'application
3. Ouvre le dossier `dist/` avec les fichiers à distribuer

### Mac / Linux
```bash
chmod +x BUILD_MAC_LINUX.sh
./BUILD_MAC_LINUX.sh
```

---

## 📦 Ce que tu envoies à tes amis

Après le build, dans le dossier `dist/` :

| Fichier | Description |
|---|---|
| `Discord Overlay Setup.exe` | Installeur (recommandé) — double-clic, suivre les étapes |
| `Discord Overlay.exe` | Version portable — pas d'installation, juste lancer |

---

## ⚙️ Configuration (pour chaque utilisateur)

1. Lancer l'app
2. Renseigner le **Token du bot** et l'**ID du salon**
3. Cliquer **Connecter**
4. Envoyer des messages/images/vidéos dans le salon Discord → apparaissent en overlay sur tous les écrans

---

## 🤖 Créer le bot Discord (une seule fois)

1. https://discord.com/developers/applications → **New Application**
2. Onglet **Bot** → **Add Bot** → copier le **Token**
3. ⚡ Activer **Message Content Intent** (obligatoire !)
4. **OAuth2 → URL Generator** : scopes `bot`, permission `Read Messages` → inviter le bot
5. Dans Discord : Paramètres → Avancé → **Mode développeur** → clic droit sur le salon → **Copier l'identifiant**

---

## Développement

```bash
npm install
npm start   # Lance en mode dev
```
