'use strict';
const joi = require('util/joi');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const Project = require('runtime/db').Project;
const Exception = require('util/exception');
const notifier = require('runtime/notifier');

module.exports = [
    bodyParser(),
    queryValidator({
        body: joi.object({
            agentId: joi.string().required(),
            projectId: joi.id().required(),
            name: joi.string().required(),
            argument: joi.array().items(joi.string()),
            command: joi.array().items(joi.string())
        })
    }),
    function* (next) {
        const body = this.request.body;
        const _id = body.projectId;
        let project = yield Project.findOne({ _id }).exec();
        if (!project) throw new Exception(404);
        let opts = {};
        opts.name = body.name;
        opts.argument = body.argument;
        opts.command = body.command;
        notifier.emit(body.agentId, 'init' , {
            project,
            opts
        }); 
        this.resolve(project);
    }
];