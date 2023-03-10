const path = require('node:path');
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('clear')
        .setDescription('delete messages')
        .addNumberOption((number) =>
            number
                .setName('number')
                .setDescription('number of messages to clear')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    , 'admin'),
};