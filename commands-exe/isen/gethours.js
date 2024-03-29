const { formatLog } = require('../../utility/Log');
const { stringify } = require('csv-stringify');
const { AttachmentBuilder } = require('discord.js');
const { Transform } = require('node:stream');
class csvSplit extends Transform {
    constructor(guildId, maxSize) {
        super({
            writableObjectMode: true,
            highWaterMark: 2,
        });
        // this.write('Adding time, Discord userId, Discord username, Title, Description, Duration\n');
        this.size = 0;
        this.maxSize = maxSize;
        this.guildId = guildId;
    }

    _transform(chunk, encoding, callback) {
        if (chunk.toString().split(',')[0] === this.guildId || chunk.toString() === 'guildId,userId,author,title,description,minutes,hours,added\n') {
            this.size = this.size + Buffer.byteLength(chunk);
            this.push(chunk);
            if (this.size > this.maxSize) {
                this.end();
            }
        }
        callback();
    }
}


module.exports = async function(interaction) {
    let csvStringified = false;
    let filesCounter = 0;
    const dbResultStream = interaction.client.hours.find().sort({ added: 1 }).project(
        {
            _id: 0,
            messageId: 0,
        },
    ).stream();

    const csvString = stringify({
        header: true,
    });

    csvString.on('end', () => {
        csvStringified = true;
    });

    const result = dbResultStream.pipe(csvString);

    async function prepareNewAttachment() {
        const csvSpliter = new csvSplit(interaction.guildId, 8300000); // Max for free users is 8Mbytes = 8388608 bytes - safety gap = 8300000
        result.pipe(csvSpliter);
        if (filesCounter === 0) {
            await interaction.reply({
                content: await interaction.translate('isen/gethours:RESPONSE'),
                files: [new AttachmentBuilder(csvSpliter, { name: await interaction.translate('isen/gethours:FILENAME', { serverName : interaction.guild.name.replaceAll(' ', '_') }) })],
            });
        } else {
            await interaction.followUp({
                content: await interaction.translate('isen/gethours:NUMBEREDRESPONSE', { number: filesCounter }),
                files: [new AttachmentBuilder(csvSpliter, { name: await interaction.translate('isen/gethours:NUMBEREDFILENAME', { serverName : interaction.guild.name.replaceAll(' ', '_'), number : filesCounter }) })],
            });
        }
        const streamEnd = new Promise((resolve, error) => {
            csvSpliter.on('end', resolve());
            csvSpliter.on('error', error());
        });
        await streamEnd;
        filesCounter++;
        if (!csvStringified) {
            result.unpipe();
            await prepareNewAttachment();
        }
    }

    await prepareNewAttachment();

    interaction.log({
        textContent: formatLog('', {}),
        author: interaction.user,
        headers: 'GetHours',
        type: 'log',
    });
};