const { checkUserChannel } = require('../../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    const mode = interaction.options.getInteger(await interaction.translate('MUSIC/MUSIC:BUILDER:MODE:NAME'), true);

    queue.setLoopMode(mode);

    await interaction.reply({ content: await interaction.translate('music/music:exe:loop', { mode: ` ${mode === 0 ? 'off' : mode === 1 ? 'track' : mode === 2 ? 'queue' : 'random'}` }) });
};