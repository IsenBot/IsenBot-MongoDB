const { client } = require('../index');
const { ApplicationCommandOptionType, SlashCommandBuilder } = require('discord.js');

function initLanguage(builder, path, json = undefined) {
    if (!json) {
        json = builder.toJSON();
    }
    const options = json.options;

    if ([ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].some(r => options?.map(option => option.type).includes(r))) { // Mean it have a subcommand group or subcommand
        path += '/' + builder.name;
        builder.setNameLocalizations(client.getLocales(path + ':BUILDER' + ':NAME', false));
    } else if (json.type === ApplicationCommandOptionType.Subcommand || builder instanceof SlashCommandBuilder) { // Mean it has no more subcommandGroup or subcommand
        path += '/' + builder.name;
        builder.setNameLocalizations(client.getLocales(path + ':BUILDER' + ':NAME', false));
        builder.setDescriptionLocalizations(client.getLocales(path + ':BUILDER' + ':DESCRIPTION', true));
    } else { // Mean it's an option
        builder.setNameLocalizations(client.getLocales(path + ':BUILDER:' + builder.name + ':NAME', false));
        builder.setDescriptionLocalizations(client.getLocales(path + ':BUILDER:' + builder.name + ':DESCRIPTION', true));
    }
    for (const [index, option] of Object.entries(builder.options ?? {})) {
        initLanguage(option, path, json.options[index]);
    }
    return builder;
}

exports.initLanguage = initLanguage;

function initContextLanguage(builder, category, path = '') { // for contexts => dont't have description
    path = path.trim().replaceAll(':', '');
    path += path.length !== 0 ? ':' : '';
    category = category.endsWith(':') ? category : category + '/' + builder.name + ':';
    builder.setNameLocalizations(client.getLocales(category + 'BUILDER:' + path + 'NAME'));
    if (builder.options) {
        for (const option of builder.options) {
            initContextLanguage(option, category, option.name);
        }
    }
    return builder;
}

exports.initContextLanguage = initContextLanguage;