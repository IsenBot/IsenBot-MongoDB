const path = require('node:path');
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { initLanguage } = require('../../utility/commandBuilder');

module.exports = {
    category: path.basename(__dirname),
    data: initLanguage(new SlashCommandBuilder()
        .setName('permission')
        .setDescription('permission manager')
        .addSubcommand(s =>
            s.setName('specify')
                .setDescription('setup permission to use a command for a specified user, role or channel')
                .addStringOption(o =>
                    o.setName('command')
                        .setDescription('bot command to setup permission')
                        .setRequired(true)
                        .setAutocomplete(true),
                )
                .addBooleanOption(o =>
                    o.setName('authorization')
                        .setDescription('permission')
                        .setRequired(true),
                )
                .addRoleOption(o =>
                    o.setName('role')
                        .setDescription('role to setup permission for')
                        .setRequired(false),
                )
                .addUserOption(o =>
                    o.setName('user')
                        .setDescription('user to setup permission for')
                        .setRequired(false),
                )
                .addChannelOption(o =>
                    o.setName('channel')
                        .setDescription('channel in wich permission will be setup')
                        .setRequired(false),
                ),
        )
        .addSubcommand(s =>
            s.setName('default')
                .setDescription('setup permission to use a command for all on all channels')
                .addStringOption(o =>
                    o.setName('command')
                        .setDescription('bot command to setup permission')
                        .setRequired(true)
                        .setAutocomplete(true),
                )
                .addBooleanOption(o =>
                    o.setName('authorization')
                        .setDescription('permission')
                        .setRequired(true),
                ),
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    , 'admin'),
};