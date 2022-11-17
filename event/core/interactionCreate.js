const { formatLog } = require('../../utility/Log');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const client = interaction.client;
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            interaction.guild.logger.log({
                textContent: formatLog('Command used', { 'CommandName': interaction.commandName }),
                headers: 'CommandHandler',
                type: 'event',
                author: interaction.user,
                url: interaction.channel.url,
            });
            // Load the command
            try {
                await client.executeCommand(interaction, command);
            } catch (error) {
                // In case of error, tell that the command failed
                interaction.guild.logger.log({
                    textContent: formatLog('Failed using command', { 'CommandName': command.commandName }),
                    headers: 'CommandHandler',
                    type: 'error',
                    author: interaction.user,
                });
                console.error(error);
                try {
                    interaction.deferred ? await interaction.editReply({ content: 'There was an error while executing this command!' }) : interaction.replied ? interaction.ephemeral ? await interaction.followUp({ content: 'There was an error while executing this command!' }) : undefined : await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                } catch {
                    null;
                }
            }
        }
    },
};