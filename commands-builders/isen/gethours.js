const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: path.basename(__dirname),
    data: new SlashCommandBuilder()
        .setName('gethours')
        .setDescription('Get a CSV file of all registered hours'),
};