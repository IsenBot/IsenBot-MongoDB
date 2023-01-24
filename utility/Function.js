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

module.exports = {
    shuffleArray,
    isUrl,
    decodeString,
};