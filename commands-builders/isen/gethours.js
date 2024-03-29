const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('gethours')
        .setDescription('Get a CSV file of all registered hours')
    , 'isen'),
};