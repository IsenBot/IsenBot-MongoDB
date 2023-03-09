const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    if(interaction.message.interaction.user.id !== interaction.user.id){
        await interaction.reply({ 
            content: interaction.translate('isen/hours:NOTAUTHOR'),
            ephemeral: true  
        });
    } else {

        await interaction.message.delete();

        interaction.log({
            textContent: formatLog('', {}),
            author: interaction.user,
            headers: ['Hours', 'Delete'],
            type: 'log',
        });
    }    
};