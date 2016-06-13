'use strict';
const config = require('config');
const notifier = require('runtime/notifier');
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            uid: joi.string().required(),
            size: joi.number().integer().min(1).required(),
            page: joi.number().integer().min(0).required(),
        })
    }),
    function* () {
        const uid = this.params.uid;
        try {
            const info = yield notifier.get(uid, 'log', {
                size: this.params.size,
                page: this.params.page,
            });
            this.resolve(info);
        } catch(e) {
            throw new Exception(404);
        }

    }
];