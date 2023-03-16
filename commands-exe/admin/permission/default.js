const { formatLog } = require('../../../utility/Log');
const { URL } = require('node:url');
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function(interaction) {

    const commandNameInput = interaction.options.getString('command');
    const perm = interaction.options.getBoolean('authorization');
    const commands = await interaction.guild.commands.fetch();
    const command = commands.find(c => c.name === commandNameInput);

    const token = await interaction.client.auth.getToken(interaction.user.id);

    const defaultMemberPermissions = perm ? null : PermissionsBitField.All;

    if (token) {
        await command.setDefaultMemberPermissions(defaultMemberPermissions)
            .then(() => {
                let message;
                if (perm) {
                    message = interaction.translate('admin/permission/default:grant', { command: command.name });
                } else {
                    message = interaction.translate('admin/permission/default:revoke', { command: command.name });
                }
                interaction.reply({
                    content: message,
                    ephemeral: true,
                });
                interaction.log({
                    textContent: formatLog('Setup permission to use command', { permission: perm.toString(), commandId: command.id }),
                    author: interaction.user,
                    headers: ['Permission', 'Default'],
                    type: 'log',
                });
            })
            .catch(error => {
                interaction.log({
                    textContent: formatLog('Failed setup permission to use command for user', { commandId: command.id, error: error.message }),
                    author: interaction.user,
                    headers: ['Permission', 'Default'],
                    type: 'error',
                });
            });
    } else {
        const authURL = new URL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&redirect_uri=${interaction.client.api.URI}${interaction.client.api.authPath}&response_type=code&scope=identify applications.commands.permissions.update`);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel(interaction.translate('admin/permission/default:button'))
                    .setURL(authURL.toString()),
            );

        interaction.reply({
            content: interaction.translate('admin/permission/default:notauth', { bot: interaction.client.user.username }),
            components: [row],
            ephemeral: true,
        });
    }
};