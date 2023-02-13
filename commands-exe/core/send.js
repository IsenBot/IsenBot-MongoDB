const { formatLog } = require('../../utility/Log');
const { userMention, hyperlink, time } = require('discord.js');

function incrementDate(date, value, identifier) {
    switch (identifier) {
    case 'y':
        date.setYear(date.getYear() + value);
        break;
    case 'mon':
        date.setMonth(date.getMonth() + value);
        break;
    case 'd':
        date.setDate(date.getDate() + value);
        break;
    case 'h':
        date.setHours(date.getHours() + value);
        break;
    case 'min':
        date.setMinutes(date.getMinutes() + value);
        break;
    case 's':
        date.setSeconds(date.getSeconds() + value);
        break;
    }
    return date;
}

function sliceDateString(stringData, identifiers, current) {
    identifiers = identifiers.filter(id => stringData.includes(id));
    if (identifiers.length === 0) {
        return current !== undefined ? { [current]: stringData } : {};
    }
    const newCurrent = identifiers.shift();
    const dataArr = stringData.split(newCurrent);
    return { ...sliceDateString(dataArr[0], identifiers, newCurrent), ...sliceDateString(dataArr[1], identifiers, current) };
}

module.exports = async function(interaction) {

    const channelToSend = interaction.options.getChannel('channel') || interaction.channel;
    const messageData = interaction.options.getString('message');
    const deleteIn = interaction.options.getString('deletein');
    const messagelink = interaction.options.getString('messagelink');
    const showMe = interaction.options.getBoolean('showme') || false;

    let message;
    if (messageData) {
        message = messageData;
    } else if (messagelink) {
        const messagelinkIds = messagelink.split('/');
        const channel = await interaction.guild.channels.fetch(messagelinkIds[messagelinkIds.length - 2]);
        const messageElem = await channel.messages.fetch(messagelinkIds[messagelinkIds.length - 1]);
        console.log(messageElem);
        message = messageElem.content;
    } else {
        interaction.reply({
            content: await interaction.translate('core/send:NOMESSAGE'),
            ephemeral: true,
        });
    }

    if (deleteIn) {
        const identifiers = ['y', 'mon', 'd', 'h', 'min', 's'];
        let deleteDate = new Date();
        for (const [key, value] of Object.entries(sliceDateString(deleteIn, identifiers))) {
            deleteDate = incrementDate(deleteDate, key, parseInt(value, 10));
        }
        message = message + await interaction.translate('core/send:DELETE', { date: time(deleteDate) });
    }

    if (showMe) {
        message = message + await interaction.translate('core/send:AUTHOR', { user: userMention(interaction.user.id), bot: userMention(interaction.client.user.id) });
    }

    const sent = await channelToSend.send(message);

    interaction.reply({
        content: await interaction.translate('core/send:SENT', { link: hyperlink('message', sent.url) }),
        ephemeral: true,
    });

    interaction.log({
        textContent: formatLog('', { message: message }),
        author: interaction.user,
        headers: ['Send'],
        type: 'log',
    });
};