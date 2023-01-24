module.exports = async function(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const subcommandGroup = interaction.options.getSubcommandGroup();

    require(`./music/${subcommandGroup ? subcommandGroup + '/' : ''}${subcommand}`)(interaction);
};