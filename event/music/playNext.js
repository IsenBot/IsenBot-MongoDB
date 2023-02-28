const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'playNext',
    once: false,

    execute: async (queue, track) => {

        const embed = new EmbedBuilder()
            .setTitle('Now Playing')
            .setURL(track?.discordMessageUrl)
            .setThumbnail(track?.avatarUrl)
            .setDescription(track?.title)
            .setTimestamp(new Date());

        await queue.musicChannel?.send({ embeds: [embed] });
    },
};