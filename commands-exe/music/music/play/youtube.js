const { EmbedBuilder } = require('discord.js');
const { checkUserChannel, isUrl } = require('../../../../utility/Function');

module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    await interaction.reply({ content: interaction.translate('music/music/play:exe:recherche'), ephemeral: true });

    const id = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    let track = null;

    if (isUrl(id)) {
        const url = new URL(id);

        const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (youtubeRegex.test(url)) {

            if (url.pathname === '/playlist') {
                const playlistId = url.searchParams.get('list');
                track = await interaction.client.player.searchYoutubePlaylist(playlistId);
            } else if (url.pathname === '/watch') {
                track = [await interaction.client.player.searchYoutubeId(id)];
            } else {
                return interaction.editReply({ content: interaction.translate('music/music/error:invalid_url'), ephemeral: true });
            }
        } else {
            return interaction.editReply({ content: interaction.translate('music/music/error:404_result'), ephemeral: true });
        }
    } else {
        track = [await interaction.client.player.searchYoutubeTrack(id)];
    }

    if (!track || !track[0] || track[0].status !== 200) return interaction.editReply({ content: interaction.translate('music/music/error:404_result'), ephemeral: true });

    const embed = new EmbedBuilder()
        .setTitle('Youtube')
        .setThumbnail(track[0].thumbnail)
        .setFooter({
            text: interaction.translate('music/music/play:exe:requested_by', { user: interaction.user.tag }),
            iconURL: interaction.user.avatarURL('png', 2048),
        })
        .setTimestamp();

    if (track.length > 1) {
        embed.setDescription(interaction.client.translate('music/music/play:exe:add_tracks_to_queue', { title: track[0].title, nb: track.length }, interaction.guild.preferredLocale));
    } else {
        embed.setDescription(interaction.client.translate('music/music/play:exe:add_track_to_queue', { title: track[0].title }, interaction.guild.preferredLocale));
    }

    const result = await interaction.followUp({ embeds: [embed] });

    track.forEach((t) => {
        t.discordMessageUrl = result.url;
        t.requestedBy = interaction.user.id;
    });

    const b = queue.connect(interaction.member.voice.channel);

    switch (b) {
    case 0:
        return interaction.followUp({
            content: interaction.translate('music/music/error:404_channel'),
            ephemeral: true,
        });
    case 1:
        return interaction.followUp({
            content: interaction.translate('music/music/error:user_not_in_same_voice'),
            ephemeral: true,
        });
    case 2:
        return interaction.followUp({
            content: interaction.translate('music/music/error:bot_permission'),
            ephemeral: true,
        });
    }

    queue.addTracks(track);

    if (!queue.playing) {
        queue.play();
    }
};