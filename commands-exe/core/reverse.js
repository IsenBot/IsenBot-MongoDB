module.exports = async function(interaction) {
    const query = interaction.options.getString("query");

    interaction.reply({content: query.split('').reverse().join(), ephemeral: true});
};