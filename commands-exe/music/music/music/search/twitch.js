const { EmbedBuilder } = require('discord.js');
module.exports = async (interaction) => {

    const client = interaction.client;

    const user_login = interaction.options.getString('query', false);
    const language = interaction.options.getString('language', false);
    const type = interaction.options.getBoolean('live', false) ? 'live' : 'all';
    const limit = interaction.options.getInteger('limit', false) || 5;

    if (limit > 25 || limit < 1) return interaction.reply({ content: await interaction.translate('music/music:exe:error:limit_out_of_range', { min: 0, max: 100 }), ephemeral: true });

    const data = await client.player.twitchApi.fetchStream({ user_login, language, type, user_id: null, limit });

    if (data.error) return interaction.reply({ content: data.status + ' ' + data.message, ephemeral: true });

    if (!data?.data?.length) return interaction.reply({ content: await interaction.translate('music/music:exe:error:404_result'), ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('Twitch Stream Search')
        .setTimestamp(new Date());

    let i = 1;

    data.data.map((stream) => {
        embed.addFields({
            name: `**${i}** - ${stream.user_name}`,
            value: `[${stream.title}](https://www.twitch.tv/${stream.user_login}) , game : ${stream.game_name} - ${stream.type === 'live' ? 'online' : 'offline'}\n`,
        });
        i++;
    });


    return interaction.reply({ embeds: [embed] });
};