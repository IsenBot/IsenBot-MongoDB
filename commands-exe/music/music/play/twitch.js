const { EmbedBuilder } = require('discord.js');
const { checkUserChannel } = require('../../../../utility/Function');

module.exports = async (interaction) => {

    const check = await checkUserChannel(interaction);

    if (!check) return;

    const username = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    await interaction.reply({ content: interaction.translate('music/music/play:exe:recherche'), ephemeral: true });

    let track;

    try {
        track = await interaction.client.player.searchTwitchStreamTrack(username);
    } catch (e) {
        return interaction.followUp({ content: interaction.translate('music/music/error:404_streamer'), ephemeral: true });
    }

    if (track.status !== 200) {
        return interaction.followUp({ content: track.error, ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('Twitch Stream')
        .setThumbnail(track.thumbnail)
        .setFooter({
            text: interaction.translate('music/music/play:exe:requested_by', { user: interaction.user.tag }),
            iconURL: interaction.user.avatarURL('png', 2048),
        })
        .setTimestamp();

    const result = await interaction.followUp({ embeds: [embed] });

    track.discordMessageUrl = result.url;

    const b = queue.connect(interaction.member.voice.channel);

    switch (b) {
    case 0:
        return interaction.followUp({ content: interaction.translate('music/music/error:404_channel'), ephemeral: true });
    case 1:
        return interaction.followUp({ content: interaction.translate('music/music/error:user_not_in_same_voice'), ephemeral: true });
    }

    queue.addTrack(track);

    if (!queue.playing) {
        queue.play();
    }
};