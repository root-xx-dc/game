const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tycoon-channel')
    .setDescription('Assign the dedicated NEON MAGNAT game login channel with access button')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select the text channel where the login panel should appear')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel');

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
        { name: 'Server Address', value: process.env.TYCOON_WEB_URL || 'http://100.111.112.57:7777/', inline: true },
        { name: 'Code Validity', value: '15 minutes (single-use)', inline: true }
      )
      .setFooter({ text: 'NEON MAGNAT - Single Shared Economy Tycoon' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_tycoon_login')
        .setLabel('Login to NEON MAGNAT')
        .setStyle(ButtonStyle.Success)
    );

    try {
      await targetChannel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `Login panel successfully posted to ${targetChannel}!`,
        ephemeral: true
      });
    } catch (err) {
      console.error('[Tycoon] Error sending panel to channel:', err);
      await interaction.reply({
        content: `Error sending panel to channel: ${err.message}`,
        ephemeral: true
      });
    }
  },
};

