'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Project = require('runtime/db').Project;
const Exception = require('util/exception');
const notifier = require('runtime/notifier');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required(),
            projectId: joi.id().required(),
            commit: joi.string().regex(/[0-9a-fA-F]+/).required()
        })
    }),
    function* (next) {
        const body = this.params;
        const commit = body.commit;
        const _id = body._id;
        const projectId = body.projectId;
        this.resolve(
            yield notifier.call(_id, 'pull-project', {
                projectId,
                commit
            })
        );
    }
];