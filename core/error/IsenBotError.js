const errorsCodes = require('./ErrorCodes');
const errorsMessage = require('./ErrorMessages');

class IsenBotDiscordAPIError extends Error {
    constructor(code, ...args) {
        super(message(code, args));
        this.code = code;
        Error.captureStackTrace?.(this, IsenBotDiscordAPIError);
    }

    get name() {
        return `${super.name} [${this.code}]`;
    }
}
function message(code, args) {
    if (!errorsCodes.includes(code)) throw new Error(`Error code must be a valid IsenBotErrorCodes. Code : ${code}`);
    const msg = errorsMessage[code];
    if (!msg) throw new Error(`No message associated with error code: ${code}.`);
    if (typeof msg === 'function') return msg(...args);
    if (!args?.length) return msg;
    args.unshift(msg);
    return String(...args);
}

function fetchError(err, ...args) {
    let finalError = err;
    const tradCode = {
        10003: ['NotFound', 'channel'],
        10004: ['NotFound', 'guild'],
        10008: ['NotFound', 'message'],
        50001: ['MissingPermission', 'message'],
        50008: ['ChannelType'],
        10014: ['InvalidReaction'],
    };
    const code = tradCode[err.code];
    if (code) {
        finalError = new IsenBotDiscordAPIError(code[0], ...args, ...code.slice(1));
    }
    Error.captureStackTrace?.(finalError, fetchError);
    return finalError;
}

module.exports = {
    // DiscordURL,
    IsenBotDiscordAPIError,
    fetchError,
};