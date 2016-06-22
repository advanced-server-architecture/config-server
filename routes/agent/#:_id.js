'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');
const Agent = require('runtime/db').Agent;

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        }),
        query: joi.object({
            fields: joi.stringArray('info.memory', 'info.cpu')
        })
    }),
    function* () {
        const fields = (this.query.fields || '')
                    .split(',')
                    .join(' ')
        const agent = yield Agent
                .findOne(this.params)
                .select('name uid ip online version createdAt updatedAt ' + fields)
                .lean()
                .exec();
        if (!agent) {
            throw new Exception(404);
        }
        this.resolve(agent);
    }
];