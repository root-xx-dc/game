const { EmbedBuilder } = require('discord.js');
const { generateAndRegisterCode } = require('../service');

module.exports = {
  customId: 'btn_tycoon_login',

  async execute(interaction) {
    const user = interaction.user;

    // Generujemy kod i rejestrujemy w bezpieczny sposób
    const code = await generateAndRegisterCode(user.id, user.username, user.displayAvatarURL());

    const embed = new EmbedBuilder()
      .setColor(0x5CB85C) // Sukces / Zieleń
      .setTitle('🔑 Twój Prywatny Kod Logowania')
      .setDescription(
        `Cześć **${user.username}**!\n\n` +
        `Oto Twój prywatny, jednorazowy kod logowania do gry:\n\n` +
        `# \`${code}\`\n\n` +
        `📋 **Co teraz zrobić:**\n` +
        `1. Przejdź na stronę gry: **http://100.111.112.57:7777/**\n` +
        `2. W zakładce **„Kod z Discorda”** wklej kod: \`${code}\`\n` +
        `3. Kliknij **„Zaloguj kodem Discord”** i wejdź do świata gry!\n\n` +
        `🔒 *Ten kod jest widoczny TYLKO dla Ciebie. Traci ważność za 15 minut.*`
      )
      .setFooter({ text: 'NEON MAGNAT - Bezpieczna Autoryzacja Discord' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true // Kluczowe: wiadomość widoczna wyłącznie dla klikającego gracza!
    });
  },
};
