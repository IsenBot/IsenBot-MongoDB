const { EmbedBuilder } = require('discord.js');
const { checkUserChannel } = require('../../../../utility/Function');

module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const username = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    await interaction.reply({ content: await interaction.translate('music/music/play:exe:recherche'), ephemeral: true });

    let track;

    try {
        track = await interaction.client.player.searchTwitchStreamTrack(username);
    } catch (e) {
        return interaction.followUp({ content: await interaction.translate('music/music/error:404_streamer'), ephemeral: true });
    }

    if (track.error) {
        return interaction.followUp({ content: track.error, ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('Twitch Stream')
        .setThumbnail(track.thumbnail)
        .setDescription(await interaction.translate('music/music/play:exe:add_track_to_queue', { title: `**${track.title}**` }) + ` by [${track.channelTitle}](${track.channelTitle === 'etoiles' ? track.url + ' "The best streamer ever"' : track.url + ' "an other good streamer"'})`);

    const result = await interaction.followUp({ embeds: [embed] });

    track.discordMessageUrl = result.url;

    queue.addTrack(track);

    const b = queue.connect(interaction.member.voice.channel);

    if (!b) return interaction.followUp({ content: await interaction.translate('music/music/error:404_channel'), ephemeral: true });

    if (!queue.playing) {
        queue.play();
    }
};