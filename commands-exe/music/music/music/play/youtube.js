const { EmbedBuilder } = require('discord.js');
const { checkUserChannel, isUrl } = require('../../../../../utility/Function');

module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    await interaction.reply({ content: await interaction.translate('music/music:exe:play:recherche'), ephemeral: true });

    const id = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    queue.connect(interaction.member.voice.channel);

    let track = null;

    if (isUrl(id)) {
        const url = new URL(id);

        if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {

            if (url.pathname === '/playlist') {
                const playlistId = url.searchParams.get('list');
                track = await interaction.client.player.searchYoutubePlaylist(playlistId);
            } else {
                track = [await interaction.client.player.searchYoutubeId(id)];
            }
        }
    } else {
        track = [await interaction.client.player.searchYoutubeId(id)];
    }

    if (!track) return interaction.editReply({ content: await interaction.translate('music/music:exe:error:404_result'), ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('Youtube')
        .setThumbnail(track[0].thumbnail);

    if (track.length > 1) {
        embed.setDescription(await interaction.translate('music/music:exe:play:add_tracks_to_queue', { title: track[0].title, nb: track.length }));
    } else {
        embed.setDescription(await interaction.translate('music/music:exe:play:add_track_to_queue', { title: track[0].title }));
    }

    const result = await interaction.followUp({ embeds: [embed] });

    track.forEach((t) => {
        t.discordMessageUrl = result.url;
    });

    queue.addTracks(track);

    if (!queue.playing) {
        queue.play();
    }
};