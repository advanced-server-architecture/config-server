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
            name: joi.string().required()
        })
    }),
    function* () {
        const uid = this.params.uid;
        try {
            let content = yield notifier.get(uid, 'cat', {
                name: this.params.name
            });
            this.resolve({
                content,
                name: this.params.name,
                uid
            });
        } catch(e) {
            throw new Exception(404);
        }

    }
];