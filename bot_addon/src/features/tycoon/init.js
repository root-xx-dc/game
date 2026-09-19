const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const loginButton = require('./buttons/loginButton');

const DEFAULT_CHANNEL_ID = process.env.TYCOON_CHANNEL_ID || '1550946302374707332';

/**
 * Wysyła wiadomość z przyciskiem logowania na wskazany kanał.
 * @param {import('discord.js').TextChannel} channel 
 */
async function sendTycoonPanel(channel) {
  const embed = new EmbedBuilder()
    .setColor(0xD49547)
    .setTitle('🏭 NEON MAGNAT - Portal Logowania do Gry')
    .setDescription(
      'Witaj w oficjalnym punkcie dostępowym do świata **NEON MAGNAT**!\n\n' +
      'Jednolity świat handlu, logistyki magazynowej w 10 miastach Europy i inwestycji w akcje koncernu **RootX**.\n\n' +
      '👉 Kliknij poniższy przycisk **„Zaloguj do Gry NEON MAGNAT”**, aby otrzymać swój prywatny, jednorazowy kod dostępu.\n\n' +
      '🔒 *Kod zostanie wyświetlony w wiadomości widocznej wyłącznie dla Ciebie.*'
    )
    .addFields(
      { name: '🌐 Serwer Gry', value: process.env.TYCOON_WEB_URL || 'http://100.111.112.57:7777/', inline: true },
      { name: '⏳ Ważność Kodu', value: '15 minut (jednorazowy)', inline: true }
    )
    .setFooter({ text: 'NEON MAGNAT - Jednolity Świat Tycoon' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_tycoon_login')
      .setLabel('Zaloguj do Gry NEON MAGNAT')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🎮')
  );

  return channel.send({ embeds: [embed], components: [row] });
}

/**
 * Sprawdza czy na kanale już istnieje panel logowania, aby nie dublować wiadomości przy restartach.
 */
async function ensureTycoonPanel(client, channelId) {
  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      console.warn(`[Tycoon] Kanał ${channelId} nie został znaleziony lub nie jest tekstowy.`);
      return;
    }

    const messages = await channel.messages.fetch({ limit: 15 }).catch(() => null);
    const existing = messages && messages.find(m => 
      m.author.id === client.user.id && 
      m.components && 
      m.components.some(r => r.components.some(b => b.customId === 'btn_tycoon_login'))
    );

    if (!existing) {
      await sendTycoonPanel(channel);
      console.log(`[Tycoon] Wysłano panel logowania na kanał ${channelId} (${channel.name || 'discord'}).`);
    } else {
      console.log(`[Tycoon] Panel logowania już istnieje na kanale ${channelId}.`);
    }
  } catch (err) {
    console.warn('[Tycoon] Błąd weryfikacji panelu na kanale:', err.message);
  }
}

/**
 * Inicjalizuje moduł integracji gry NEON MAGNAT w bocie Discord.
 * @param {import('discord.js').Client} client
 */
function initTycoon(client) {
  // 1. Obsługa przycisku logowania
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'btn_tycoon_login') {
      try {
        await loginButton.execute(interaction);
      } catch (err) {
        console.error('[Tycoon] Błąd obsługi przycisku logowania:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Wystąpił błąd podczas generowania kodu dostępu. Spróbuj ponownie.',
            ephemeral: true
          }).catch(() => {});
        }
      }
    }
  });

  // 2. Automatyczne upewnienie się że panel istnieje na kanale po uruchomieniu bota
  if (client.isReady()) {
    ensureTycoonPanel(client, DEFAULT_CHANNEL_ID);
  } else {
    client.once('ready', () => {
      ensureTycoonPanel(client, DEFAULT_CHANNEL_ID);
    });
  }

  console.log(`[Tycoon] Moduł integracji załadowany (kanał docelowy: ${DEFAULT_CHANNEL_ID}).`);
}

module.exports = { initTycoon, sendTycoonPanel, ensureTycoonPanel };
