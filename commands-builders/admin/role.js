const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('role')
        .setDescription('give role on action')
        .addSubcommandGroup(group => group
            .setName('reaction')
            .setDescription('give role on reaction')
            .addSubcommand(subCommand => subCommand
                .setName('new')
                .setDescription('Create a role reaction on a new message')
                .addStringOption(option => option
                    .setName('reaction')
                    .setDescription('The reaction on which to give a role')
                    .setRequired(true),
                )
                .addRoleOption(option => option
                    .setName('role')
                    .setDescription('The role to give on the reaction')
                    .setRequired(true),
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel on which to send the message with the role react')
                    .setRequired(false),
                ),
            )
            .addSubcommand(subCommand => subCommand
                .setName('add')
                .setDescription('Add a role reaction on a message')
                .addStringOption(option => option
                    .setName('reaction')
                    .setDescription('The reaction on which to give a role')
                    .setRequired(true),
                )
                .addRoleOption(option => option
                    .setName('role')
                    .setDescription('The role to give on the reaction')
                    .setRequired(true),
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel of the message')
                    .setRequired(true),
                )
                .addStringOption(option => option
                    .setName('message_id')
                    .setDescription('The id of the message on which to add the role react')
                    .setRequired(true),
                ),
            )
            .addSubcommand(subCommand => subCommand
                .setName('remove')
                .setDescription('Remove one role reaction on a message')
                .addStringOption(option => option
                    .setName('reaction')
                    .setDescription('The reaction, of the role react, to remove')
                    .setRequired(true),
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel of the message')
                    .setRequired(true),
                )
                .addStringOption(option => option
                    .setName('message_id')
                    .setDescription('The id of the message on which to remove the role react')
                    .setRequired(true),
                ),
            )
            .addSubcommand(subCommand => subCommand
                .setName('delete')
                .setDescription('Remove all the roles reactions on a message')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel of the message')
                    .setRequired(true),
                )
                .addStringOption(option => option
                    .setName('message_id')
                    .setDescription('The id of the message on which to remove all the role react')
                    .setRequired(true),
                ),
            ),
        )
    , 'admin'),
};