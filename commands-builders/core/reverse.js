import {ApplicationCommandOptionType} from "discord.js";
const path = require('node:path');

module.exports = {
    category: path.basename(__dirname),
    data: {
        name: "core/reverse:BUILDER:NAME",
        description: 'core/reverse:BUILDER:DESCRIPTION',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "core/reverse:BUILDER:OPTIONS:NAME",
                description: "core/reverse:BUILDER:OPTIONS:DESCRIPTION",
                required: true,
            }
        ]
    }
};