const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    if(interaction.message.interaction.user.id !== interaction.user.id){
        await interaction.reply({ 
            content: interaction.translate('isen/hours:NOTAUTHOR'),
            ephemeral: true  
        });
    } else {
        const modal = new ModalBuilder()
            .setCustomId('hoursModal')
            .setTitle(interaction.translate('isen/hours:TITLE'));
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('Title')
            .setLabel(interaction.translate('isen/hours:SHORT:PLACEHOLDER'))
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('Description')
            .setLabel(interaction.translate('isen/hours:PARAGRAPH:PLACEHOLDER'))
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);

        interaction.log({
            textContent: formatLog('', {}),
            author: interaction.user,
            headers: ['Hours', 'SetText'],
            type: 'log',
        });
    }    
};