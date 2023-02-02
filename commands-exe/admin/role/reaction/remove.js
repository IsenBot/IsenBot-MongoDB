const { removeRoleReaction } = require('../../../../utility/database');
const { getMessageFromId } = require('../../../../utility/commandOptions');
const { formatLog } = require('../../../../utility/Log');
module.exports = async function(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // Get message
    const message = await getMessageFromId(interaction);
    // Get options
    const emoji = interaction.options.getString('reaction');
    // Execute
    // Check if the message is a role reaction
    const data = await removeRoleReaction(interaction.client, message, emoji, true);
    if (!data.value) {
        return await interaction.editReply(interaction.translate('admin/role/reaction/remove:NOT_USE', {
            emoji: emoji.toString(),
            link: message.url,
        }));
    }
    interaction.log({
        headers: ['Role', 'Reaction', 'Remove'],
        type: 'success',
        textContent: formatLog('Role reaction removed', { 'Reaction': emoji, 'Roles': data.value.roles }),
        author: interaction.user,
        url: message.url,
    });
    // Remove the reaction and response to the user
    const roleReactionManager = await message.reactions.resolve(emoji);
    return await roleReactionManager.users.remove(interaction.client.id).then(
        () => {
            return interaction.editReply(interaction.translate('admin/role/reaction/remove:SUCCESS', {
                emoji: emoji,
                link: message.url,
                roles: data.value.roles,
            }));
        }, err => {
            interaction.log({
                headers: ['Role', 'Reaction', 'Remove'],
                type: 'error',
                textContent: formatLog('Failed to remove the reaction', { 'Reaction' : emoji }),
                url: message.url,
            });
            console.dir(err);
            return interaction.editReply(interaction.translate('admin/role/reaction/remove:ERROR', {
                link: message.url,
                emoji: emoji,
            }) + '\n' + interaction.translate('admin/role/reaction/remove:SUCCESS', {
                link: message.url,
                emoji: emoji,
                roles: data.value.roles,
            }),
            );
        },
    );
};