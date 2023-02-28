const path = require('node:path');
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('send')
        .setDescription('send a message')
        .addStringOption((string) =>
            string
                .setName('message')
                .setDescription('message to send')
                .setRequired(false),
        )
        .addStringOption((string) =>
            string
                .setName('messagelink')
                .setDescription('link to message to copy and send')
                .setRequired(false),
        )
        .addChannelOption((channel) =>
            channel
                .setName('channel')
                .setDescription('channel to send the message')
                .setRequired(false),
        )
        .addStringOption((string) =>
            string
                .setName('deletein')
                .setDescription('counter before deleting')
                .setRequired(false),
        )
        .addBooleanOption((bool) =>
            bool
                .setName('showme')
                .setDescription('show the author of the message')
                .setRequired(false),
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    , 'core'),
};