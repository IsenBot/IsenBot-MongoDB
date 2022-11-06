async function execute(channel) {
    const client = channel.client;
    if (channel.isThread()) {
        // The thread is only store locally, not in the database
        if (channel.guild.thread?.id === channel.id) {
            channel.guild.commandLogger.removeLogThread();
        }
        if (client.logger.thread?.id === channel.id) {
            client.logger.removeLogThread();
        }
    }
    else if (channel.isTextBased()) {
        if (channel.guild.logChannel?.id === channel.id) {
            // Suppress it locally and in the database
            client.removeLogChannel(channel.guild);
        }
        if (client.logger.logChannel?.id === channel.id) {
            // The client logChannel is only store locally, not in the database
            // The bot owner will have to update the config.js file
            client.logger.removeLogChannel();
        }
    }
}

module.exports = execute;