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
        body: joi.object({
            agentId: joi.string().required(),
            ref: joi.id().required(),
            id: joi.id().required(),
            location: joi.string().required()
        })
    }),
    function* (next) {
        const body = this.request.body;
        const file = yield File
            .findOne({
                ref: body.ref,
                _id: body.id
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
        notifier.emit(body.agentId, 'pushfile' , {
            file,
            location
        });
        this.resolve('OK');
    }
];