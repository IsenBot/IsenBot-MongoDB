const { getRoleReaction, addRoleReaction } = require('../../../../utility/database');
const { formatLog } = require('../../../../utility/Log');
const { getMessageFromId } = require('../../../../utility/commandOptions');
module.exports = async function(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // Get message
    const message = await getMessageFromId(interaction);
    // Get options
    const emoji = interaction.options.getString('reaction');
    const role = interaction.options.getRole('role');
    // Execute
    const existing = await getRoleReaction(interaction.client, message, emoji);
    if (existing) {
        return await interaction.editReply(interaction.translate('admin/role/reaction/add:ALREADY_USE', {
            emoji: emoji,
            roles: existing.roles,
            link: message.url,
        }));
    }
    try {
        await message.react(emoji);
    } catch (e) {
        interaction.log({
            textContent: formatLog('Failed to react', { 'Reaction': emoji }),
            headers: ['Role', 'Reaction', 'Add'],
            type: 'error',
            url: message.url,
            author: interaction.user,
        });
        console.error(e);
        return await interaction.editReply(interaction.translate('admin/role/reaction/add:ERROR', {
            link: message.url,
            emoji: emoji,
        }));
    }
    await addRoleReaction(interaction.client, message, emoji, role.id, false);
    interaction.log({
        textContent: formatLog('New role reaction add', { 'Reaction': emoji, 'Roles': role }),
        headers: ['Role', 'Reaction', 'Add'],
        type: 'success',
        url: message.url,
        author: interaction.user,
    });
    return await interaction.editReply(interaction.translate('admin/role/reaction/add:SUCCESS', {
        emoji: emoji,
        role: role.toString(),
        link: message.url,
    }));
};