const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { initContextLanguage } = require('../../utility/commandBuilder');
const path = require('node:path');

module.exports = {
    category: path.basename(__dirname),
    data: initContextLanguage(new ContextMenuCommandBuilder()
        .setName('sendContext')
        .setType(ApplicationCommandType.Message)
    , 'core'),
};