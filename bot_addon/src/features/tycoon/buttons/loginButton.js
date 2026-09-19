const { EmbedBuilder } = require('discord.js');
const { generateAndRegisterCode } = require('../service');

module.exports = {
  customId: 'btn_tycoon_login',

  async execute(interaction) {
    const user = interaction.user;

    const code = await generateAndRegisterCode(user.id, user.username, user.displayAvatarURL());

    const embed = new EmbedBuilder()
      .setColor(0x5CB85C)
      .setTitle('Your Private Access Code')
      .setDescription(
        `Hello **${user.username}**!\n\n` +
        `Here is your private, one-time login code for NEON MAGNAT:\n\n` +
        `# \`${code}\`\n\n` +
        `How to join:\n` +
        `1. Open the game in your browser: **http://100.111.112.57:7777/**\n` +
        `2. On the main page, keep the default "Discord Code" tab selected.\n` +
        `3. Enter your code \`${code}\` and click "Enter Game with Code".\n\n` +
        `*This code is visible ONLY to you. It is single-use and expires in 15 minutes.*`
      )
      .setFooter({ text: 'NEON MAGNAT - Secure Discord Access' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  },
};

