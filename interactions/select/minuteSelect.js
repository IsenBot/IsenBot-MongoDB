const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    const db = await interaction.mongodb;

    db.collection('isen/hours').updateOne(
        {
            messageId: interaction.message.id,
        },
        {
            $set: { minutes: parseInt(interaction.values[0], 10) },
        },
        {
            upset: true,
        });

    const embed = interaction.message.embeds[0];
    const minuteSelect = interaction.message.components[1].components[0];
    const query = await db.collection('isen/hours').findOne({ messageId: interaction.message.id });

    if (parseInt(interaction.values[0], 10) !== 0) {
        embed.data.title = await interaction.translate('isen/hours:TIME', {
            hour: query.hours,
            minute: interaction.values[0].toString(10),
        });
        minuteSelect.data.placeholder = `${interaction.values[0].toString(10)}min`;
    }

    await interaction.update({ embeds: [embed] });

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: ['Hours', 'MinuteSelect'],
        type: 'log',
    });
};