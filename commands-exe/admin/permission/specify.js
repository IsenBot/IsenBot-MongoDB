const { formatLog } = require('../../../utility/Log');
const { URL } = require('node:url');
const { ApplicationCommandPermissionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function(interaction) {

    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');
    const commandNameInput = interaction.options.getString('command');
    const perm = interaction.options.getBoolean('authorization');
    const commands = await interaction.guild.commands.fetch();
    const command = commands.find(c => c.name === commandNameInput);

    const permissions = [];

    if (user) {
        permissions.push({
            id: user.id,
            type: ApplicationCommandPermissionType.User,
            permission: perm,
        });
    }
    if (role) {
        permissions.push({
            id: role.id,
            type: ApplicationCommandPermissionType.Role,
            permission: perm,
        });
    }
    if (channel) {
        permissions.push({
            id: channel.id,
            type: ApplicationCommandPermissionType.Channel,
            permission: perm,
        });
    }

    const token = await interaction.client.auth.getToken(interaction.user.id);

    if (token) {
        if (permissions.length > 0) {
            await interaction.guild.commands.permissions.add({ command: command.id, token: token, permissions: permissions })
                .then(() => {
                    let message;
                    if (perm) {
                        message = interaction.translate('admin/permission/specify:grant') + '\n';
                    } else {
                        message = interaction.translate('admin/permission/specify:revoke') + '\n';
                    }
                    if (user) {
                        message = message + interaction.translate('admin/permission/specify:user', { user: user, command: command.name }) + '\n';
                    }
                    if (role) {
                        message = message + interaction.translate('admin/permission/specify:role', { role: role, command: command.name }) + '\n';
                    }
                    if (channel) {
                        message = message + interaction.translate('admin/permission/specify:channel', { channel: channel, command: command.name });
                    }
                    interaction.reply({
                        content: message,
                        ephemeral: true,
                    });
                    interaction.log({
                        textContent: formatLog('Setup permission to use command', { permission: perm.toString(), commandId: command.id, userId: user?.id, roleId: role?.id, channelId: channel?.id }),
                        author: interaction.user,
                        headers: ['Permission', 'Specify'],
                        type: 'log',
                    });
                })
                .catch(error => {
                    interaction.log({
                        textContent: formatLog('Failed setup permission to use command for user', { commandId: command.id, userId: user?.id, roleId: role?.id, channelId: channel?.id, error: error.message }),
                        author: interaction.user,
                        headers: ['Permission', 'Specify'],
                        type: 'error',
                    });
                });
        } else {
            interaction.reply({
                content: interaction.translate('admin/permission/specify:nomentionable'),
                ephemeral: true,
            });
        }
    } else {
        const authURL = new URL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&redirect_uri=${interaction.client.api.URI}:${interaction.client.api.port}${interaction.client.api.authPath}&response_type=code&scope=identify applications.commands.permissions.update`);
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel(interaction.translate('admin/permission/specify:button'))
                    .setURL(authURL.toString()),
            );

        interaction.reply({
            content: interaction.translate('admin/permission/specify:notauth', { bot: interaction.client.user.username }),
            components: [row],
            ephemeral: true,
        });
    }
};