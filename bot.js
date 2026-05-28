<<<<<<< HEAD
const { Client, GatewayIntentBits } = require('discord.js');

let client = null;

/**
 * Détermine le type d'une pièce jointe Discord.
 * Gère images, GIFs, vidéos, et les GIFs Tenor/Giphy embarqués.
 */
function classifyAttachment(att) {
  const ct  = (att.contentType || '').toLowerCase();
  const url = att.url || '';

  // GIF explicite (content-type ou extension)
  if (ct === 'image/gif' || /\.gif(\?|$)/i.test(url)) {
    return { type: 'gif', url };
  }
  // Image statique
  if (ct.startsWith('image/') || /\.(jpg|jpeg|png|webp|apng)(\?|$)/i.test(url)) {
    return { type: 'image', url };
  }
  // Vidéo
  if (ct.startsWith('video/') || /\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return { type: 'video', url };
  }
  return null;
}

/**
 * Extrait les GIFs depuis les embeds Discord (Tenor, Giphy, liens directs .gif).
 */
function extractEmbedMedia(embeds) {
  const items = [];
  for (const embed of embeds) {
    // Tenor / Giphy renvoient une vidéo mp4 dans embed.video
    if (embed.video && embed.video.url) {
      const vurl = embed.video.url;
      // Tenor encode souvent en .mp4 — on le traite comme gif animé
      if (/tenor\.com|giphy\.com/i.test(vurl) || /\.(gif|mp4|webm)(\?|$)/i.test(vurl)) {
        items.push({ type: 'gif-video', url: vurl });
        continue;
      }
    }
    // Image dans l'embed (gif direct partagé en lien)
    if (embed.image && embed.image.url) {
      const iurl = embed.image.url;
      if (/\.gif(\?|$)/i.test(iurl)) {
        items.push({ type: 'gif', url: iurl });
      } else {
        items.push({ type: 'image', url: iurl });
      }
    }
    // Thumbnail (petites previews)
    if (embed.thumbnail && embed.thumbnail.url && !embed.image) {
      items.push({ type: 'image', url: embed.thumbnail.url });
    }
  }
  return items;
}

async function start(token, channelId, onMessage) {
  if (client) await stop();

  return new Promise((resolve, reject) => {
    const TIMEOUT_MS = 15_000;
    const timer = setTimeout(() => {
      if (client) client.destroy().catch(() => {});
      reject(new Error('Timeout de connexion. Vérifiez votre token.'));
    }, TIMEOUT_MS);

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    client.once('ready', () => {
      clearTimeout(timer);
      console.log(`[Bot] Connecté en tant que ${client.user.tag}`);
      resolve();
    });

    client.on('error', (err) => console.error('[Bot] Erreur :', err.message));

    client.on('messageCreate', (message) => {
      if (message.author.bot) return;
      if (message.channelId !== channelId) return;

      const msg = {
        id:          message.id,
        author:      message.author.username,
        avatar:      message.author.displayAvatarURL({ size: 64, extension: 'png' }),
        content:     message.content || '',
        timestamp:   Date.now(),
        attachments: []
      };

      // ── Pièces jointes directes ─────────────────────────────
      for (const [, att] of message.attachments) {
        const classified = classifyAttachment(att);
        if (classified) msg.attachments.push(classified);
      }

      // ── Embeds (Tenor, Giphy, liens GIF) ───────────────────
      if (message.embeds && message.embeds.length > 0) {
        const embedMedia = extractEmbedMedia(message.embeds);
        msg.attachments.push(...embedMedia);
      }

      onMessage(msg);
    });

    client.login(token).catch((err) => {
      clearTimeout(timer);
      reject(new Error(`Connexion échouée : ${err.message}`));
    });
  });
}

async function stop() {
  if (client) {
    client.removeAllListeners();
    await client.destroy().catch(() => {});
    client = null;
    console.log('[Bot] Déconnecté.');
  }
}

module.exports = { start, stop };
=======
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 👉 URL du serveur (Render plus tard)
const SERVER_URL = "https://TON-SERVEUR.onrender.com";

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    await fetch(`${SERVER_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "text",
            content: message.content
        })
    });
});

client.login(process.env.DISCORD_TOKEN);
>>>>>>> 6f0691070b20671e996165df04b697ea7761f159
