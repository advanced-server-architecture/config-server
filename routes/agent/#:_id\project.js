'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');
const Agent = require('runtime/db').Agent;

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        })
    }),
    function* () {
        const agent = yield Agent
                    .findOne(this.params)
                    .select('project')
                    .lean()
                    .exec();
        if (!agent) {
            throw new Exception(404);
        }
        this.resolve(agent);
    }
];