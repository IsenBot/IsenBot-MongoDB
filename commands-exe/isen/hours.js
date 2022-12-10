const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    const hoursSelect = new StringSelectMenuBuilder()
        .setCustomId('hourSelect')
        .setPlaceholder(await interaction.translate('isen/hours:HOUR:PLACEHOLDER'));
    for (let i = 0; i < 12; i++) {
        hoursSelect.addOptions({
            label: `${i.toString(10)}h`,
            value: i.toString(10),
        });
    }
    const minuteSelect = new StringSelectMenuBuilder()
        .setCustomId('minuteSelect')
        .setPlaceholder(await interaction.translate('isen/hours:MINUTE:PLACEHOLDER'));
    for (let i = 0; i < 60; i += 5) {
        minuteSelect.addOptions({
            label: `${i.toString(10)}min`,
            value: i.toString(10),
        });
    }
    const row = new ActionRowBuilder().addComponents(hoursSelect);
    const row2 = new ActionRowBuilder().addComponents(minuteSelect);
    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('hoursUpdate')
                .setLabel(await interaction.translate('isen/hours:BUTTON:UPDATE'))
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('hoursValidate')
                .setLabel(await interaction.translate('isen/hours:BUTTON:VALIDATE'))
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('hoursDelete')
                .setLabel(await interaction.translate('isen/hours:BUTTON:DELETE'))
                .setStyle(ButtonStyle.Danger),
        );

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(await interaction.translate('isen/hours:TITLE'))
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], components:[row, row2, row3] });

    const reply = await interaction.fetchReply();
    const db = await interaction.mongodb;
    db.collection('isen/hours').insertOne(
        {
            messageId: reply.id,
            userId: interaction.user.id,
            author: interaction.user.username,
            minutes: 0,
            hours: 0,
            title: undefined,
            description: undefined,
            added: new Date().toTimeString(),
        });

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: 'Hours',
        type: 'log',
    });
};