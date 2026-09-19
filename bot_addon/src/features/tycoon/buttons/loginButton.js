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
        `Oto Twój unikalny, jednorazowy kod logowania do gry:\n\n` +
        `# \`${code}\`\n\n` +
        `📋 **Co teraz zrobić:**\n` +
        `1. Przejdź na stronę gry w przeglądarce.\n` +
        `2. W oknie logowania kliknij niebieski przycisk **„Zaloguj przez Discord”**.\n` +
        `3. Wklej powyższy kod \`${code}\` i zatwierdź.\n\n` +
        `🔒 *Ten kod jest widoczny TYLKO dla Ciebie. Nikt na kanale go nie widzi. Kod traci ważność za 15 minut.*`
      )
      .setFooter({ text: 'NEON MAGNAT - Bezpieczna Autoryzacja Discord' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true // Kluczowe: wiadomość widoczna wyłącznie dla klikającego gracza!
    });
  },
};
