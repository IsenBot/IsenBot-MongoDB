module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        const client = channel.client;
        const guild = channel.guild;
        if (channel.isTextBased()) {
            if (guild.logChannel?.id === channel.id) {
                // Suppress it locally and in the database
                client.removeLogChannel(guild);
                client.log({
                    textContent: 'Log channel deleted',
                    headers: ['Logger', 'Channel'],
                    type: 'event',
                });
            }
            if (client.logger.logChannel?.id === channel.id) {
                // The client logChannel is only store locally, not in the database
                // The bot owner will have to update the config.js file
                client.logger.removeLogChannel();
                client.log({
                    textContent: 'Client log channel deleted',
                    headers: ['Logger', 'Channel'],
                    type: 'event',
                });
            }
        }
    },
};