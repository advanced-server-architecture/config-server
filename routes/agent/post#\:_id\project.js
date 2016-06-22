'use strict';
const joi = require('util/joi');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const Project = require('runtime/db').Project;
const Agent = require('runtime/db').Agent;
const Exception = require('util/exception');
const notifier = require('runtime/notifier');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        }),
        body: joi.object({
            _id: joi.id().required(),
            name: joi.string().required(),
            argument: joi.array().items(joi.string()),
            command: joi.array().items(joi.string())
        })
    }),
    function* (next) {
        const body = this.request.body;
        const _id = body._id;
        let project = yield Project
            .findOne({ _id })
            .lean()
            .exec();
        if (!project) throw new Exception(404);
        let opts = {};
        opts.name = body.name;
        opts.argument = body.argument;
        opts.command = body.command;

        this.resolve(
            yield notifier.call(this.params._id, 'init-project', {
                project,
                opts
            })
        );
    }
];