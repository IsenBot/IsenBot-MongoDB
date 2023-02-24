const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) return interaction.reply({ content: interaction.translate('music/music/error:no_track'), ephemeral: true });

    queue.stop();

    await interaction.reply({ content: await interaction.client.translate('music/music/stop:exe:stop', {}, interaction.guild.preferredLocale) });
};