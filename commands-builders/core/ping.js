const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');

module.exports = {
    category: path.basename(__dirname),
    data: new SlashCommandBuilder()
        .setNamePath('core/ping:BUILDER:NAME')
        .setDescription('core/ping:BUILDER:DESCRIPTION'),
};