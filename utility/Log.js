// UTILITY FUNCTIONS FOR LOG
//
// If a function is given and return something, return the result of the function by the text. Otherwise, return the text
function formatString(fn, text) {
    if (fn instanceof Function) {
        return fn(text) ? fn(text) : text;
    }
    return text;
}
// Check if the two date have the same years, month and day of the month
function dateMatch(date1, date2) {
    if (!(date1 instanceof Date)) { date1 = new Date(date1); }
    if (!(date2 instanceof Date)) { date2 = new Date(date2); }
    return getFullDate(date1, 'YYYY-MM-DD') === getFullDate(date2, 'YYYY-MM-DD');
}
// Return the date with the given format as string ( YYYY : the year, MM : the month, DD : the day of the month, HH : the hours, MIN : the minutes, SS : the seconds)
function getFullDate(date, format = 'YYYY-MM-DD HH:MIN:SS') {
    return format.replace('YYYY', date.getUTCFullYear())
        .replace('MM', (date.getUTCMonth().length === 1 ? '0' : '') + date.getUTCMonth())
        .replace('DD', (date.getUTCDate().length === 1 ? '0' : '') + date.getUTCDate())
        .replace('HH', (date.getHours().length ? '0' : '') + date.getHours())
        .replace('MIN', (date.getMinutes().length ? '0' : '') + date.getMinutes())
        .replace('SS', (date.getSeconds().length ? '0' : '') + date.getSeconds());
}
// Return an object containing the description and the fields for an embed from a string with a specific format
function stringToEmbed(string) {
    if (string == null || string === '') {
        return { description: null, fields: [] };
    }
    if (!(string instanceof String)) {
        throw new Error('The textContent for the embed must be a string or null');
    }

    let lines = string.split(' | ');
    lines = lines.map((line, index) => {
        line = line.split(' : ');
        if (line.length === 1) {
            if (index === 0) {
                return line[0];
            } else {
                return {
                    inline: true,
                    name: '\u200B',
                    value: line[0],
                };
            }
        }
        return {
            inline: true,
            name: line[0],
            value: line[1],
        };
    });

    let description = null;
    if (typeof lines[0] === 'string') {
        description = lines[0];
        lines.splice(0, 1);
    }

    return { description, fields: lines };
}
// Return a loggable text without header with the options added if they are not nullish
function formatLog(previousText, options = {}) {
    if (!(options instanceof Object)) {
        throw new Error('options must be an object');
    }
    for (const entry of Object.entries(options)) {
        if (entry[1]) {
            if (previousText !== '') {
                previousText += ' | ';
            }
            previousText += `${entry[0]} : ${entry[1]}`;
        }
    }
    return previousText;
}

module.exports = {
    formatString,
    dateMatch,
    getFullDate,
    stringToEmbed,
    formatLog,
};