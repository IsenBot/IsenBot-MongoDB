const { ContextMenuCommandBuilder, ApplicationCommandType, PermissionsBitField } = require('discord.js');
const { initContextLanguage } = require('../../utility/commandBuilder');
const path = require('node:path');

module.exports = {
    category: path.basename(__dirname),
    data: initContextLanguage(new ContextMenuCommandBuilder()
        .setName('sendContext')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    , 'core'),
};