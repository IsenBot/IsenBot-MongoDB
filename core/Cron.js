const CronJob = require('cron').CronJob;
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const { MessagesToDeleteSchema } = require('../utility/Schema');
const { formatLog } = require('../utility/Log');


class CronTasker extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.tasksList = {};
    }

    add(time, task, id) { // time and task are mandatory, id is facultative : a new one will be generated if id is undefined
        try {
            const job = new CronJob(time, task, null, true);
            const uniqueId = id !== undefined ? id : crypto.randomUUID();
            this.tasksList[uniqueId] = job;
            this.client.log({
                textContent: formatLog('Added a new task', { 'id' : uniqueId, 'execution' : time }),
                headers: 'CronTasker',
                type: 'log',
            });
            return uniqueId;
        } catch (e) {
            console.log(e);
            try {
                task();
            } catch (error) {
                this.client.log({
                    textContent: formatLog('Failed adding and executing task', { 'error' : error.message }),
                    headers: 'CronTasker',
                    type: 'error',
                });
            }
            return false;
        }
    }

    delete(id) {
        this.tasksList[id].stop();
        delete this.tasksList[id];
    }

    async addMessageToDelete(message, time, prevId) {
        const id = this.add(time, () => {
            message.delete();
            this.client.messagesToDelete.deleteMany({
                messageId: message.id,
                channelId: message.channelId,
                guildId: message.guildId,
                deleteTimestamp: time,
            });
        }, prevId);
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