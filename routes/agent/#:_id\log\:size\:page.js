'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');
const Log = require('runtime/db').Log;

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required(),
            size: joi.number().integer().min(1).required(),
            page: joi.number().integer().min(0).required(),
        })
    }),
    function* () {
        const _id = this.params._id;
        const size = this.params.size;
        const page = this.params.page;

        const total = yield Log.count({ agentId: _id }).exec();

        const log = yield Log
                .find({ agentId: _id })
                .sort('-date')
                .skip(page * size)
                .limit(size)
                .lean()
                .exec();
        this.resolve({
            log,
            size,
            page,
            total
        });
    }
];