module.exports = async (interaction) => {


    const queue = interaction.client.player.getQueue(interaction.guildId);

    const conection = queue.connection;

    console.log(conection);

    /*
    const mode = interaction.options.getInteger('mode', true);

    queue.setLoopMode(mode);

    await interaction.reply({ content: `Loop mode set to ${mode === 0 ? 'off' : mode === 1 ? 'track' : mode === 2 ? 'queue' : 'random'}` });
*/};