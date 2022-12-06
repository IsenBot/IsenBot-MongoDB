module.exports = async function(interaction) {
    const link = interaction.options.getString(await interaction.client.translate("core/reverse:BUILDER:OPTIONS:NAME"), true).split("/").slice(-3);

    if (link.length !== 3) {
        return await interaction.reply({content: await interaction.translate("core/reverse:ERROR:INVALID_LINK"), ephemeral: true});
    }

    const channel = await interaction.client.channels.cache.get(link[1]);

    if (!channel) {
        return await interaction.reply({content: await interaction.translate("core/reverse:ERROR:INVALID_CHANNEL"), ephemeral: true});
    }

    const message = await channel.messages?.fetch(link[2])

    if (!message || !(await message).content) return await interaction.reply({content: await interaction.translate("core/reverse:ERROR:MESSAGE_NOT_FOUND"), ephemeral: true})

    const reply = await message.reply({content: `Reverse : ${message.content.split('').reverse().join('')}`});

    await interaction.reply({content: reply.url, ephemeral: true});
};