const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('hoursModal')
        .setTitle(await interaction.translate('isen/hours:TITLE'));
    const favoriteColorInput = new TextInputBuilder()
        .setCustomId('Title')
        .setLabel(await interaction.translate('isen/hours:SHORT:PLACEHOLDER'))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const hobbiesInput = new TextInputBuilder()
        .setCustomId('Description')
        .setLabel(await interaction.translate('isen/hours:PARAGRAPH:PLACEHOLDER'))
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

    const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
    const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: ['Hours', 'Update'],
        type: 'log',
    });
};