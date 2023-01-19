const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {

    await interaction.message.edit({ components:[] });

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: ['Hours', 'Validate'],
        type: 'log',
    });
};