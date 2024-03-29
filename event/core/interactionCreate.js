const { formatLog } = require('../../utility/Log');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        const client = interaction.client;
        if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            interaction.guild.logger.log({
                textContent: formatLog('Received autocomplete interaction', { 'CommandName': interaction.commandName }),
                headers: 'InteractionHandler',
                type: 'event',
                author: interaction.user,
                url: interaction.channel.url,
            });
            try {
                await client.executeAutocomplete(interaction);
            } catch (error) {
                interaction.guild.logger.log({
                    textContent: formatLog('Failed sending autocomplete', { 'CommandName': interaction.commandName, 'Error message': error.message }),
                    headers: 'InteractionHandler',
                    type: 'error',
                    author: interaction.user,
                });
                console.log(error);
            }
        }
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
                    textContent: formatLog('Failed using command', { 'CommandName': command.commandName, 'Error message': error.message }),
                    headers: 'CommandHandler',
                    type: 'error',
                    author: interaction.user,
                });
                try {
                    interaction.deferred ? await interaction.editReply({ content: 'There was an error while executing this command!' }) : interaction.replied ? interaction.ephemeral ? await interaction.followUp({ content: 'There was an error while executing this command!' }) : undefined : await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                } catch {
                    null;
                }
            }
        }
        if (interaction.isButton()) {
            interaction.guild.logger.log({
                textContent: formatLog('Button clicked', { 'ButtonName': interaction.customId }),
                headers: 'InteractionHandler',
                type: 'event',
                author: interaction.user,
                url: interaction.channel.url,
            });
            try {
                await client.executeButton(interaction);
            } catch (error) {
                interaction.guild.logger.log({
                    textContent: formatLog('Failed using button', { 'ButtonName': interaction.customId, 'Error message': error.message }),
                    headers: 'InteractionHandler',
                    type: 'error',
                    author: interaction.user,
                });
                try {
                    interaction.deferred ? await interaction.editReply({ content: 'There was an error while calling this button!' }) : interaction.replied ? interaction.ephemeral ? await interaction.followUp({ content: 'There was an error while calling this button!' }) : undefined : await interaction.reply({ content: 'There was an error while calling this button!', ephemeral: true });
                } catch {
                    null;
                }
            }
        }
        if (interaction.isStringSelectMenu() || interaction.isRoleSelectMenu() || interaction.isUserSelectMenu()) {
            interaction.guild.logger.log({
                textContent: formatLog('Select clicked', { 'SelectName': interaction.customId }),
                headers: 'InteractionHandler',
                type: 'event',
                author: interaction.user,
                url: interaction.channel.url,
            });
            try {
                await client.executeSelect(interaction);
            } catch (error) {
                interaction.guild.logger.log({
                    textContent: formatLog('Failed using select', { 'SelectName': interaction.customId, 'Error message': error.message }),
                    headers: 'InteractionHandler',
                    type: 'error',
                    author: interaction.user,
                });
                try {
                    interaction.deferred ? await interaction.editReply({ content: 'There was an error while calling this select!' }) : interaction.replied ? interaction.ephemeral ? await interaction.followUp({ content: 'There was an error while calling this select!' }) : undefined : await interaction.reply({ content: 'There was an error while calling this select!', ephemeral: true });
                } catch {
                    null;
                }
            }
        }
        if (interaction.isModalSubmit()) {
            interaction.guild.logger.log({
                textContent: formatLog('Modal submitted', { 'ModalName': interaction.customId }),
                headers: 'InteractionHandler',
                type: 'event',
                author: interaction.user,
                url: interaction.channel.url,
            });
            try {
                await client.executeModal(interaction);
            } catch (error) {
                interaction.guild.logger.log({
                    textContent: formatLog('Failed submitting modal', { 'ModalName': interaction.customId, 'Error message': error.message }),
                    headers: 'InteractionHandler',
                    type: 'error',
                    author: interaction.user,
                });
                try {
                    interaction.deferred ? await interaction.editReply({ content: 'There was an error while submitting this modal!' }) : interaction.replied ? interaction.ephemeral ? await interaction.followUp({ content: 'There was an error while submitting this modal!' }) : undefined : await interaction.reply({ content: 'There was an error while submitting this modal!', ephemeral: true });
                } catch {
                    null;
                }
            }
        }
    },
};