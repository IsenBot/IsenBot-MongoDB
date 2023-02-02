const { getMessageFromId } = require('../../../../utility/commandOptions');
const { removeRoleReactionByMessage } = require('../../../../utility/database');


module.exports = async function(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // Get message
    const message = await getMessageFromId(interaction);
    // Execute
    const result = await removeRoleReactionByMessage(interaction.client, message);
    if (result.deletedCount > 0) {
        interaction.log({
            headers: ['Role', 'Reaction', 'Delete'],
            type: 'success',
            textContent: `Deleted ${result.deletedCount} role reaction`,
            url: message.url,
            author: interaction.user,
        });
        const botReactions = message.reactions.cache.filter(reaction => reaction.me);
        let success = true;
        for (const reaction of botReactions.values()) {
            try {
                await reaction.users.remove(interaction.client.id);
            } catch (e) {
                interaction.log({
                    headers: ['Role', 'Reaction', 'Delete'],
                    type: 'error',
                    textContent: `Fail to remove the reaction ${reaction.emoji}`,
                    url: message.url,
                });
                success = false;
                console.error(e);
            }
        }
        if (!success) {
            return interaction.editReply(
                interaction.translate('admin/role/reaction/delete:ERROR', { link: message.url })
                + '\n'
                + interaction.translate('admin/role/reaction/delete:SUCCESS', { link: message.url }),
            );
        }
        return interaction.editReply(interaction.translate('admin/role/reaction/delete:SUCCESS', { link: message.url }));
    }
    return interaction.editReply(interaction.translate('admin/role/reaction/delete:NOT_USE', { link: message.url }));
};