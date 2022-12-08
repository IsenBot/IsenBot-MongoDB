const { client } = require('../index');

function initLanguage(builder, category, path = '') {
    path = path.trim().replaceAll(':', '');
    path += path.length !== 0 ? ':' : '';
    category = category.endsWith(':') ? category : category + '/' + builder.name + ':';
    builder.setNameLocalizations(client.getLocales(category + 'BUILDER:' + path + 'NAME'));
    builder.setDescriptionLocalizations(client.getLocales(category + 'BUILDER:' + path + 'NAME'));
    if (builder.options) {
        for (const option of builder.options) {
            initLanguage(option, category, option.name);
        }
    }
    return builder;
}

exports.initLanguage = initLanguage;