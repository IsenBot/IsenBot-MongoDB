const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('invite')
        .setDescription('test')
        .addChannelOption((channel) =>
            channel
                .setName('channelinput')
                .setDescription('test')
                .setRequired(false),
        )
    , 'core'),
};