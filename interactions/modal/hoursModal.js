const { formatLog } = require('../../utility/Log');

module.exports = async function(interaction) {
    const embed = interaction.message.embeds[0];

    embed.data.fields = [{ name: interaction.fields.fields.get('Title').value, value: interaction.fields.fields.get('Description').value, inline:false }];

    const row = interaction.message.components[0];
    const row2 = interaction.message.components[1];
    const row3 = interaction.message.components[2];

    interaction.client.hours.updateOne(
        {
            messageId : interaction.message.id,
        },
        {
            $set : {
                title: interaction.fields.fields.get('Title').value,
                description: interaction.fields.fields.get('Description').value,
            },
        },
        {
            upset: true,
        },
    );

    await interaction.update({ embeds: [embed], components: [row, row2, row3] });

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: ['Hours', 'ModalSubmitted'],
        type: 'log',
    });
};