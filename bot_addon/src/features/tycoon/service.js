const http = require('http');
const https = require('https');

// Aktywne kody trzymane w pamięci bota
const activeCodes = new Map();

/**
 * Generuje unikalny kod, zapisuje w pamięci i rejestruje w backendzie gry.
 * @param {string} discordId
 * @param {string} username
 * @param {string} avatar
 * @returns {Promise<string>}
 */
async function generateAndRegisterCode(discordId, username, avatar) {
  // Usuń poprzednie kody tego użytkownika
  for (const [c, data] of activeCodes.entries()) {
    if (data.discordId === discordId) {
      activeCodes.delete(c);
    }
  }

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const code = `DC-${randomDigits}`;

  activeCodes.set(code, {
    discordId,
    username,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  // Rejestracja w API gry bez ujawniania żadnych danych użytkownikowi
  const apiUrl = process.env.TYCOON_API_URL || 'http://127.0.0.1:7777';
  try {
    const payload = JSON.stringify({
      code: code,
      discord_id: String(discordId),
      username: String(username),
      avatar: String(avatar || '')
    });

    const parsed = new URL(apiUrl + '/api/auth/discord/code');
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(parsed, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 3000
    });

    req.on('error', (e) => {
      // W razie chwilowej niedostępności sieci gra i tak obsłuży format DC-XXXXXX
      console.warn('[Tycoon] Ostrzeżenie: Rejestracja kodu w API gry offline:', e.message);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.warn('[Tycoon] Rejestracja lokalna powiodła się.');
  }

  return code;
}

module.exports = {
  generateAndRegisterCode,
  activeCodes
};
