'use strict';
const config = require('config');

module.exports = [
    function* () {
        this.body = config.WS_PORT.toString();
        this.type = 'text';
        this.status = 200;
    }
];