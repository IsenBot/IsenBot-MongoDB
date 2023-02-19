const { formatLog } = require('../../utility/Log');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');


module.exports = async function(interaction) {

    const modal = new ModalBuilder()
        .setCustomId('sendModal')
        .setTitle(await interaction.translate('core/sendContext:MODAL:TITLE'));

    const channelInput = new TextInputBuilder()
        .setCustomId('channel')
        .setLabel(await interaction.translate('core/sendContext:MODAL:PLACEHOLDER'))
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const newActionRow = new ActionRowBuilder().addComponents(channelInput);

    modal.addComponents(newActionRow);
    await interaction.showModal(modal);

    const sameUserFilter = i => {
        return i.user.id === interaction.user.id;
    };

    interaction.awaitModalSubmit({ sameUserFilter, time: 300000 })
        .then(async i => {
            await i.deferReply({ ephemeral : true });
            return i;
        })
        .then(async i => {
            const channelInputValue = await require('../../interactions/modal/sendModal')(i);
            const channelSplitted = channelInputValue.split('/');
            if (channelSplitted.length > 3) {
                const channel = await interaction.guild.channels.fetch(channelSplitted[channelSplitted.length - 1]);
                const message = await channel.send(interaction.targetMessage.content);
                await i.editReply(await interaction.translate('core/sendContext:REPLY:SUCCESS', { url: message.url }));
            } else {
                await i.editReply(await interaction.translate('core/sendContext:REPLY:ERROR', { channelUrl: channelInputValue }));
            }
        })
        .catch(error => {
            if (error.message !== 'Interaction has already been acknowledged.') {
                interaction.guild.logger.log({
                    textContent: formatLog('Failed submitting modal', { 'ModalName': interaction.customId, 'Error message': error.message }),
                    headers: 'SendContext',
                    type: 'error',
                    author: interaction.user,
                });
            }
        });


    interaction.log({
        textContent: formatLog('', { messageContent: interaction.targetMessage }),
        author: interaction.user,
        headers: ['SendContext'],
        type: 'log',
    });
};