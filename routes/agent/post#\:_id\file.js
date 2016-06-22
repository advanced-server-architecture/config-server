'use strict';
const joi = require('util/joi');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const File = require('runtime/db').File;
const Exception = require('util/exception');
const notifier = require('runtime/notifier');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        }),
        body: joi.object({
            ref: joi.id().required(),
            _id: joi.id().required(),
            location: joi.string().required()
        })
    }),
    function* (next) {
        const body = this.request.body;
        const file = yield File
            .findOne({
                ref: body.ref,
                _id: body._id
            })
            .lean()
            .exec();

        if (!file) {
            throw new Exception(404);
        }

        let location = body.location;
        for (const char of location) {
            if (char === '.' ||
                char === '/') {
                location = location.substr(1);
            } else {
                break;
            }
        }

         this.resolve(
            yield notifier.call(this.params._id, 'push-file', {
                file,
                location
            })
        );
    }
];