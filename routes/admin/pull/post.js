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
            name: joi.string().required(),
            commit: joi.string().required()
        })
    }),
    function* (next) {
        const body = this.request.body;
        notifier.emit(body.agentId, 'pull' , {
            name: body.name,
            commit: body.commit
        }); 
        this.resolve('OK');
    }
];