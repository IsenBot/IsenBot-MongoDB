const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    if(interaction.message.interaction.user.id !== interaction.user.id){
        await interaction.reply({ 
            content: interaction.translate('isen/hours:NOTAUTHOR'),
            ephemeral: true  
        });
    } else {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hoursUpdate')
                    .setLabel(interaction.translate('isen/hours:BUTTON:UPDATE'))
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('hoursDelete')
                    .setLabel(interaction.translate('isen/hours:BUTTON:DELETE'))
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.update({ components:[row] });

        interaction.log({
            textContent: formatLog('', {}),
            author: interaction.user,
            headers: ['Hours', 'Validate'],
            type: 'log',
        });
    }    
};