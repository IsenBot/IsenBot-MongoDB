const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {

    const username = interaction.options.getString('query', true);

    const queue = interaction.client.player.getQueue(interaction.guildId);

    await interaction.reply({ content: `Searching for **${username}**`, ephemeral: true });

    if (!interaction.member?.voice.channel) {
        return interaction.followUp({
            content: 'You need to be in a voice channel to use this command!',
            ephemeral: true,
        });
    }

    queue.connect(interaction.member.voice.channel);

    const track = await interaction.client.player.searchTwitchStreamTrack(username);

    if (track.error) {
        return interaction.followUp({ content: track.error, ephemeral: true });
    }

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