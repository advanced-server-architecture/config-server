'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Agent = require('runtime/db').Agent;

module.exports = [
    queryValidator({
        query: joi.object({
            fields: joi.stringArray('info.memory', 'info.cpu')
        })
    }),
    function* () {
        const fields = (this.query.fields || '')
                    .split(',')
                    .join(' ')
        const agent = yield Agent
                .find()
                .select('name uid ip online version createdAt updatedAt ' + fields)
                .lean()
                .exec();
        this.resolve(agent);
    }
];