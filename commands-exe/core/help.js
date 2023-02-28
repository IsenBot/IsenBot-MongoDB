const { ApplicationCommandPermissionType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function(interaction) {
    const commands = await interaction.guild.commands.fetch();
    const perms = await interaction.guild.commands.permissions.fetch();
    const authCommands = [];
    const forbiddenCommands = [];
    await interaction.member.fetch();
    const rolesList = await interaction.member.roles.cache;

    await commands.forEach((command, commandId) => {
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            authCommands.push(command);
        } else {
            const defaultPerm = command.defaultMemberPermissions === null ? true : interaction.member.permissions.has(command.defaultMemberPermissions, true);
            if (perms.has(commandId)) { // In this case there are some specific commands overrides
                const permList = perms.get(commandId).filter(p => (p.id === interaction.member.id && p.type === ApplicationCommandPermissionType.User) || (rolesList.has(p.id) && p.type === ApplicationCommandPermissionType.Role));
                if (permList.length > 0) {
                    if (permList.find(p => p.id === interaction.member.id && p.type === ApplicationCommandPermissionType.User && p.permission)) {
                        authCommands.push(command);
                        return;
                    } else if (!permList.find(p => p.id === interaction.member.id && p.type === ApplicationCommandPermissionType.User && !p.permission)) {
                        if (defaultPerm && !permList.find(p => rolesList.has(p.id) && p.type === ApplicationCommandPermissionType.Role && !p.permission)) {
                            authCommands.push(command);
                            return;
                        }
                        if (permList.find(p => rolesList.has(p.id) && p.type === ApplicationCommandPermissionType.Role && p.permission)) {
                            authCommands.push(command);
                            return;
                        }
                    }
                } else if (defaultPerm) {
                    authCommands.push(command);
                    return;
                }
            } else if (defaultPerm) {
                authCommands.push(command);
                return;
            }
            forbiddenCommands.push(commands);
        }
    });

    const authFields = authCommands.map(command => {
        const commandCategory = interaction.client.commands.get(command.name);
        if (commandCategory) {
            return { name: ':small_blue_diamond:  ' + interaction.translate(`${commandCategory}/${command.name}:BUILDER:NAME`), value: interaction.translate(`${commandCategory}/${command.name}:HELP`) };
        }
        return { name: ':small_blue_diamond:  ' + command.name, value: command.description };
    });

    const forbidFields = forbiddenCommands.map(command => {
        const commandCategory = interaction.client.commands.get(command.name);
        if (commandCategory) {
            return { name: ':small_orange_diamond:  ' + interaction.translate(`${commandCategory}/${command.name}:BUILDER:NAME`), value: interaction.translate(`${commandCategory}/${command.name}:HELP`) };
        }
        return { name: ':small_orange_diamond:  ' + command.name, value: command.description };
    });

    const embed = new EmbedBuilder(interaction.client.embedTemplate)
        .setTitle(interaction.translate('core/help:FUNCTIONLIST', { name: interaction.client.user.username }))
        .setDescription(interaction.translate('core/help:EMBED_DESCRIPTION', { user: interaction.user.username }))
        .addFields(authFields)
        .addFields(forbidFields);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel(interaction.translate('core/help:LINK'))
                .setURL('https://github.com/IsenBot/IsenBot-MongoDB#readme'),
        );


    await interaction.reply({
        embeds: [embed],
        components: [row],
    });

    interaction.log({
        textContent: '',
        author: interaction.user,
        headers: 'Help',
        type: 'log',
    });
};