'use strict';
const config = require('config');
const notifier = require('runtime/notifier');
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            uid: joi.string().required()
        })
    }),
    function* () {
        const uid = this.params.uid;
        try {
            const info = yield notifier.get(uid, 'memory');
            this.resolve(info);
        } catch(e) {
            throw new Exception(404);
        }

    }
];