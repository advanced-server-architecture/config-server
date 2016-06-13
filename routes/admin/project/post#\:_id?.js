'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const bodyParser = require('koa-bodyparser')
const Project = require('runtime/db').Project;
const Exception = require('util/exception');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id()
        }),
        body: joi.object({
            accessToken: joi.string().required(),
            repo: joi.string().required(),
            command: joi.array().items(joi.string()),
            username: joi.string().required(),
            main: joi.string().required(),
            argument: joi.array().items(joi.string())
        })
    }),
    function* (next) {
        let project;
        const _id = this.params._id;
        const body = this.request.body;
        if (_id) {
            project = yield Project.findOne({ _id }).exec();
            if (!project) throw new Exception(404);
        } else {
            project = new Project();
        }
        project.accessToken = body.accessToken;
        project.main = body.main;
        project.username = body.username;
        project.repo = body.repo;
        project.command = body.command || [];
        project.argument = body.argument || [];
        yield project.save();
        this.resolve(project);
    }
];