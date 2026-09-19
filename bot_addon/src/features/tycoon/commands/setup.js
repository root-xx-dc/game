const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tycoon-channel')
    .setDescription('Przypisz dedykowany kanał logowania do gry NEON MAGNAT z przyciskiem dla graczy')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Wybierz kanał tekstowy, na którym pojawi się panel logowania')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('kanal');

    const embed = new EmbedBuilder()
      .setColor(0xD49547) // Motyw Ciemny Dąb / Neon Magnat Gold
      .setTitle('🏭 NEON MAGNAT - Portal Logowania do Gry')
      .setDescription(
        'Witaj w oficjalnym punkcie dostępowym do świata **NEON MAGNAT**!\n\n' +
        'Aby połączyć swoje konto Discord z grą i otrzymać **jednorazowy, bezpieczny kod dostępu**:\n\n' +
        '👉 Kliknij poniższy przycisk **„Zaloguj do Gry”**.\n\n' +
        '🔒 *Twój kod zostanie wyświetlony w prywatnej wiadomości widocznej wyłącznie dla Ciebie. Nikt inny na kanale go nie zobaczy.*'
      )
      .addFields(
        { name: '🌐 Adres Serwera Gry', value: process.env.TYCOON_WEB_URL || 'Dostępny w ogłoszeniach serwera', inline: true },
        { name: '⏳ Ważność Kodu', value: '15 minut (jednorazowy)', inline: true }
      )
      .setFooter({ text: 'NEON MAGNAT - Ekonomiczna Strategia Przemysłowa' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('btn_tycoon_login')
        .setLabel('Zaloguj do Gry NEON MAGNAT')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎮')
    );

    try {
      await targetChannel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `✅ Pomyślnie wysłano panel logowania na kanał ${targetChannel}!`,
        ephemeral: true
      });
    } catch (err) {
      console.error('[Tycoon] Błąd wysyłania na kanał:', err);
      await interaction.reply({
        content: `❌ Wystąpił błąd podczas wysyłania panelu na kanał: ${err.message}`,
        ephemeral: true
      });
    }
  },
};
