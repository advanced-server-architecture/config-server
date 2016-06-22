'use strict';
const config = require('config');

module.exports = [
    function* () {
        this.body = {
            port: config.WEBSOCKET.PORT,
            interval: config.WEBSOCKET.INTERVAL
        };
        this.type = 'json';
        this.status = 200;
    }
];