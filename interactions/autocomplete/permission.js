module.exports = async function(interaction) {

    const focusedValue = interaction.options.getFocused();
    const commands = await interaction.guild.commands.fetch();
    const filtered = commands.map(c => c.name).filter(c => c.startsWith(focusedValue));
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));

    interaction.log({
        textContent: '',
        author: interaction.user,
        headers: ['Autocomplete', 'Permission'],
        type: 'log',
    });
};