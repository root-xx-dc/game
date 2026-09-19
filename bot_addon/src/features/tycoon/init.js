const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const loginButton = require('./buttons/loginButton');

const DEFAULT_CHANNEL_ID = process.env.TYCOON_CHANNEL_ID || '1550946302374707332';

/**
 * Creates the official English access portal payload.
 */
function buildTycoonPanelPayload() {
  const embed = new EmbedBuilder()
    .setColor(0xD49547)
    .setTitle('NEON MAGNAT - Access Portal')
    .setDescription(
      'Welcome to the official access gateway for **NEON MAGNAT**.\n\n' +
      'A persistent single-world economy featuring 10 European trading hubs, freight logistics, 5 industrial sectors, and RootX Corporation stock equity.\n\n' +
      'Click the button below to generate your private, one-time access code.\n\n' +
      '*Your code will appear in an ephemeral response visible only to you.*'
    )
    .addFields(
      { name: 'Code Validity', value: '15 minutes (single-use)', inline: true },
      { name: 'Access Mode', value: 'Discord One-Time Passcode', inline: true }
    )
    .setFooter({ text: 'NEON MAGNAT - Single Shared Economy Tycoon' })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_tycoon_login')
      .setLabel('Login to NEON MAGNAT')
      .setStyle(ButtonStyle.Success)
  );

  return { embeds: [embed], components: [row] };
}

/**
 * Ensures the persistent panel exists on the designated channel.
 * If an existing panel is found, updates it with the clean English message.
 */
async function ensureTycoonPanel(client, channelId) {
  try {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      console.warn(`[Tycoon] Channel ${channelId} not found or is not text-based.`);
      return;
    }

    const payload = buildTycoonPanelPayload();
    const messages = await channel.messages.fetch({ limit: 15 }).catch(() => null);
    const existing = messages && messages.find(m => 
      m.author.id === client.user.id && 
      m.components && 
      m.components.some(r => r.components.some(b => b.customId === 'btn_tycoon_login'))
    );

    if (existing) {
      await existing.edit(payload);
      console.log(`[Tycoon] Updated existing access panel on channel ${channelId}.`);
    } else {
      await channel.send(payload);
      console.log(`[Tycoon] Sent new access panel to channel ${channelId}.`);
    }
  } catch (err) {
    console.warn('[Tycoon] Panel verification error:', err.message);
  }
}

/**
 * Initializes the Tycoon module with persistent button support.
 * @param {import('discord.js').Client} client
 */
async function initTycoon(client) {
  // 1. Register persistent button in DB and in-memory registry
  try {
    const buttonRegistry = require('../../utils/buttonRegistry');
    buttonRegistry.registerHandler('tycoon', async (interaction) => {
      await loginButton.execute(interaction);
    });
  } catch (e) {}

  try {
    const { ButtonPersist } = require('../../database');
    if (ButtonPersist) {
      await ButtonPersist.upsert({ customId: 'btn_tycoon_login', handlerModule: 'tycoon' });
    }
  } catch (e) {}

  // 2. Direct button interaction fallback listener
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'btn_tycoon_login') {
      try {
        await loginButton.execute(interaction);
      } catch (err) {
        console.error('[Tycoon] Button interaction error:', err);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: 'An error occurred while generating your access code. Please try again.',
            ephemeral: true
          }).catch(() => {});
        }
      }
    }
  });

  // 3. Ensure the English, persistent panel is posted on startup
  if (client.isReady()) {
    ensureTycoonPanel(client, DEFAULT_CHANNEL_ID);
  } else {
    client.once('ready', () => {
      ensureTycoonPanel(client, DEFAULT_CHANNEL_ID);
    });
  }

  console.log(`[Tycoon] Module initialized with persistent button support (channel: ${DEFAULT_CHANNEL_ID}).`);
}

module.exports = { initTycoon, buildTycoonPanelPayload, ensureTycoonPanel };

