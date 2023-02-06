const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    interaction.client.hours.updateOne(
        {
            messageId: interaction.message.id,
        },
        {
            $set: { hours: parseInt(interaction.values[0], 10) },
        },
        {
            upset: true,
        });

    const embed = interaction.message.embeds[0];
    const hourSelect = interaction.message.components[0].components[0];
    const query = await interaction.client.hours.findOne({ messageId: interaction.message.id });
    console.log(query);

    if (parseInt(interaction.values[0], 10) !== 0) {
        embed.data.title = await interaction.translate('isen/hours:TIME', {
            hour: interaction.values[0].toString(10),
            minute: query.minutes,
        });
        hourSelect.data.placeholder = `${interaction.values[0].toString(10)}h`;
    }

    await interaction.update({ embeds: [embed] });

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: ['Hours', 'HourSelect'],
        type: 'log',
    });
};