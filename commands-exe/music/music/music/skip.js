const { checkUserChannel } = require('../../../../utility/Function');
module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const queue = interaction.client.player.getQueue(interaction.guildId);

    queue.skip();

    await interaction.reply({ content: await interaction.translate('music/music:exe:skip') });
};