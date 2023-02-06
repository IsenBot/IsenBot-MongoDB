const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {

    await interaction.message.delete();

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: ['Hours', 'Delete'],
        type: 'log',
    });
};