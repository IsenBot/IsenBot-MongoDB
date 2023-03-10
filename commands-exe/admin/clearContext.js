const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {

    const channel = interaction.channel;
    const id = interaction.targetMessage.id;

    const messagesToDelete = await channel.messages.fetch({ after: id, cache: true });
    await channel.bulkDelete(messagesToDelete);

    interaction.reply({
        content: interaction.translate('admin/clearContext:SUCCESS', { number: messagesToDelete.size }),
        ephemeral: true,
    });

    interaction.log({
        textContent: formatLog('', { messageContent: interaction.targetMessage }),
        author: interaction.user,
        headers: ['SendContext'],
        type: 'log',
    });
};