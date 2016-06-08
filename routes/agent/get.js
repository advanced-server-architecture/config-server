'use strict';
const notifier = require('runtime/notifier');

module.exports = [
    function* () {
        const info = yield notifier.list();
        this.resolve(info);
    }
];