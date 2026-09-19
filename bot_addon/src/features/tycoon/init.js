const loginButton = require('./buttons/loginButton');

/**
 * Inicjalizuje moduł integracji gry NEON MAGNAT w bocie Discord.
 * @param {import('discord.js').Client} client
 */
function initTycoon(client) {
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
          });
        }
      }
    }
  });

  console.log('[Tycoon] Moduł logowania przyciskiem załadowany pomyślnie.');
}

module.exports = { initTycoon };
