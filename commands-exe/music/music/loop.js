const { checkUserChannel } = require('../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    if (!queue || !queue.playing) return interaction.reply({ content: interaction.translate('music/music/error:no_track'), ephemeral: true });

    const mode = interaction.options.getInteger('mode', true);

    queue.loopMode = mode;

    await interaction.reply({ content: interaction.client.translate('music/music/loop:exe:loop', { mode: ` **${mode === 0 ? 'off' : mode === 1 ? 'track' : mode === 2 ? 'queue' : 'random'}**` }, interaction.guild.preferredLocale) });
};