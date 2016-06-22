'use strict';
const notifier = require('runtime/notifier');
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required(),
           projectId: joi.id().required()
        })
    }),
    function* () {
        const _id = this.params._id;
        const projectId = this.params.projectId;
        this.resolve(
            yield notifier.call(_id, 'stop', projectId)
        );
    }
];