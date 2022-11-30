const path = require('node:path');

module.exports = {
    category: path.basename(__dirname),
    data: {
        name: "core/ping:BUILDER:NAME",
        description: 'core/ping:BUILDER:DESCRIPTION'
    }
};