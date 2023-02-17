const CronJob = require('cron').CronJob;
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const { MessagesToDeleteSchema } = require('../utility/Schema');


class CronTasker extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.tasksList = {};
    }

    add(time, task) {
        try {
            const job = new CronJob(time, task, null, true);
            const uniqueId = crypto.randomUUID();
            this.tasksList[uniqueId] = job;
            return uniqueId;
        } catch {
            task();
            return false;
        }
    }

    delete(id) {
        this.tasksList[id].stop();
        delete this.tasksList[id];
    }

    async addMessageToDelete(message, time) {
        const id = this.add(time, () => {
            message.delete();
            this.client.messagesToDelete.deleteMany({
                messageId: message.id,
                channelId: message.channelId,
                guildId: message.guildId,
                deleteTimestamp: time,
            });
        });
        if (id) {
            await this.client.messagesToDelete.insertOne(new MessagesToDeleteSchema({
                id: id,
                messageId: message.id,
                channelId: message.channelId,
                guildId: message.guildId,
                deleteTimestamp: time,
            }));
        }
        return id;
    }
}

module.exports = CronTasker;