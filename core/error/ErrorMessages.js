module.exports = {
    'MissingURL': 'You must provide an url',
    'InvalidURL': 'The given url is not valid',

    'MissingPermission': (name, id) => `Missing permission to access to the ${name} ${id}.`,
    'NotFound': (name, id) => `The ${name} ${id} doesn't exist.`,

    'ChannelType': id => `The channel ${id} must be text-based.`,

    'EmojiNotFound': emoji => `The emoji ${emoji} isn't valid.`,
};