const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionsBitField } = require('discord.js');
const { initContextLanguage } = require('../../utility/commandBuilder');
const path = require('node:path');

module.exports = {
    category: path.basename(__dirname),
    data: initContextLanguage(new ContextMenuCommandBuilder()
        .setName('clearContext')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    , 'admin'),
};