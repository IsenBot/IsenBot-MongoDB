const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {

    const username = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    await interaction.reply({ content: `Searching for **${username}**`, ephemeral: true });

    const member = interaction.member;

    if (!member?.voice.channel) {
        return interaction.followUp({
            content: 'You need to be in a voice channel to use this command!',
            ephemeral: true,
        });
    }

    // TODO put that in the class and handle it
    const user = (await interaction.client.player.twitchApi.fetchUser(username)).data[0];

    if (!user) {
        return interaction.followUp({
            content: 'No results found!',
            ephemeral: true,
        });
    }

    const stream = (await interaction.client.player.twitchApi.fetchStream({ user_id: user.id, user_login: null, type: null, language: null, limit: 2 }))?.data[0];

    if (!stream) return interaction.followUp({ content: 'The streamer you requested is offline !', ephemeral: true });

    const voiceChannel = member.voice.channel;

    queue.connect(voiceChannel);

    const track = await interaction.client.player.searchTwitchStreamTrack(username);

    if (!track) return interaction.followUp({ content: 'No stream found! Streamer maybe offline', ephemeral: true });

    track.title = stream.title;
    track.thumbnail = stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080');
    track.avatarUrl = user.profile_image_url;

    const embed = new EmbedBuilder()
        .setTitle('Twitch Stream')
        .setImage(track.thumbnail)
        .setDescription(`Add to queue \`${track.title}\` by [${track.channelTitle}](${track.channelTitle === 'etoiles' ? track.url + ' "The best streamer ever"' : track.url + ' "an other good streamer"'})`);

    const result = await interaction.followUp({ embeds: [embed] });

    track.discordMessageUrl = result.url;

    queue.addTrack(track);

    if (!queue.playing) {
        queue.play();
    }
};