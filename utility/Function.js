function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isUrl(query) {
    try {
        new URL(query);
        return true;
    } catch (e) {
        return false;
    }
}

function decodeString(html) {
    return html.replace(/&#([0-9]{1,3});/gi, function(match, num) {
        return String.fromCharCode(parseInt(num));
    });
}

async function checkUserChannel(interaction) {
    if (!interaction.member?.voice.channel) {
        await interaction.reply({
            content: await interaction.translate('music/music/error:user_not_in_voice'),
            ephemeral: true,
        });

        return false;
    }

    if (interaction?.guild?.me?.channel && interaction.member?.voice.channel.id !== interaction.guild.me?.voice?.channel?.id) {
        await interaction.reply({
            content: await interaction.translate('music/music/error:user_not_in_same_voice'),
            ephemeral: true,
        });

        return false;
    }

    return true;
}

module.exports = {
    shuffleArray,
    isUrl,
    decodeString,
    checkUserChannel,
};