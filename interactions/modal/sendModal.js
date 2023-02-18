const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {

    const channel = interaction.fields.fields.get('channel').value;

    interaction.log({
        textContent: formatLog('', { channelLink: channel }),
        author: interaction.user,
        headers: ['Send', 'ModalSubmitted'],
        type: 'log',
    });

    return channel;
};