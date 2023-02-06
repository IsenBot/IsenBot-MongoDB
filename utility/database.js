const { RoleReactionSchema } = require('./Schema');
async function addRoleReaction(client, message, reaction, roles, checkIfIn = true) {
    const collection = client.roleReactCollection;
    if (checkIfIn) {
        const query = {
            messageId: message.id,
            reaction,
        };
        const roleReactionData = await collection.findOne(query);
        if (roleReactionData) {
            return roleReactionData;
        }
    }
    const toInsert = new RoleReactionSchema({
        messageId: message.id,
        reaction,
        channelId: message.channel.id,
        guildId: message.guildId,
        roles,
    });
    const resultData = await collection.insertOne(toInsert);
    if (!resultData?.insertedId) {
        return undefined;
    }
    return resultData;
}
async function getRoleReaction(client, message, reaction) {
    const collection = client.roleReactCollection;
    const query = {
        messageId: message.id,
        reaction,
    };
    return await collection.findOne(query);
}
async function getRoleReactionByMessage(client, message) {
    const collection = client.roleReactCollection;
    const query = {
        messageId : message.id,
    };
    return await collection.find(query);
}

async function removeRoleReaction(client, message, reaction, returnData = false) {
    const collection = client.roleReactCollection;
    const query = {
        messageId: message.id,
        reaction,
    };
    if (returnData) {
        return await collection.findOneAndDelete(query);
    }
    return await collection.deleteOne(query);
}
async function removeRoleReactionByMessage(client, message) {
    const collection = client.roleReactCollection;
    const query = {
        messageId: message.id,
    };
    return await collection.deleteMany(query);
}
module.exports = {
    addRoleReaction,
    getRoleReaction,
    removeRoleReaction,
    getRoleReactionByMessage,
    removeRoleReactionByMessage,
};