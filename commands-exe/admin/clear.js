const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {

    const channel = interaction.channel;
    const number = interaction.options.getNumber('number');

    await channel.bulkDelete(number);

    interaction.reply({
        content: interaction.translate('admin/clearContext:SUCCESS', { number: number }),
        ephemeral: true,
    });

    interaction.log({
        textContent: formatLog('', { messageContent: interaction.targetMessage }),
        author: interaction.user,
        headers: ['SendContext'],
        type: 'log',
    });
};