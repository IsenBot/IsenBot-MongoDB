const { formatLog } = require('../../utility/Log');
const csv = require('csv');
const { AttachmentBuilder } = require('discord.js');

module.exports = async function(interaction) {
    const db = await interaction.mongodb;
    const dbResultStream = db.collection('isen/hours').find().sort({ added: 1 }).project(
        {
            _id: 0,
            messageId: 0,
        },
    ).stream();// Sends a readable Stream in Object mode (each data chunk is an object)

    const csvString = csv.stringify({ // Takes piped readable object stream and stringifies it to CSV format
        header: true, // Objects keys are added as column names (csv first line)
    });

    dbResultStream.pipe(csvString); // Pipes the readable stream to csvString that is writeable AND readeable

    interaction.reply({
        content: 'Here is your result',
        files: [new AttachmentBuilder(csvString, { name: 'hours.cvs' })],
    });

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: 'GetHours',
        type: 'log',
    });
};