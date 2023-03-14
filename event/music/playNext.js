const { EmbedBuilder } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = {
    name: 'playNext',
    once: false,

    execute: async (queue, track) => {

        try {
            const embed = new EmbedBuilder()
                .setTitle('Now Playing')
                .setURL(track?.discordMessageUrl)
                .setThumbnail(track?.avatarUrl)
                .setDescription(`${track?.title}\n\nAsked by <@${track?.requestedBy}>`)
                .setTimestamp(new Date());

            await queue.musicChannel?.send({ embeds: [embed] });
        } catch (e) {
            queue.client.log({
                textContent: formatLog('Can\'t send message in the channel : ', {
                    channelId: queue.musicChannel.id,
                    error: e.message,
                }),
                headers: ['Music', 'Error'],
                type: 'Error',
            });
        }
    },
};