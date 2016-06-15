'use strict';
const notifier = require('runtime/notifier');
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');
const _ = require('lodash');

module.exports = [
    queryValidator({
        params: joi.object({
            uid: joi.string().required()
        })
    }),
    function* () {
        const list = yield notifier.list();
        const info = _.find(list, { uid: this.params.uid });
        if (!info) {
            throw new Exception(404);
        }
        this.resolve(info);
    }
];