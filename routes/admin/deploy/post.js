'use strict';
const joi = require('util/joi');
const bodyParser = require('koa-bodyparser');
const queryValidator = require('middleware/queryValidator');
const Git = require('runtime/db').Git;
const Exception = require('util/exception');
const notifier = require('runtime/notifier');

module.exports = [
    bodyParser(),
    queryValidator({
        body: joi.object({
            agent: joi.string().required(),
            project: joi.id().required(),
            commit: joi.string().required(),
            opts: joi.object()
        })
    }),
    function* (next) {
        const body = this.request.body;
        const _id = body.project;
        let git = yield Git.findOne({ _id }).exec();
        if (!git) throw new Exception(404);
        git.commit = body.commit;
        git.status = 'Deploying';
        yield git.save();
        let opts = body.opts;
        if (opts.args) {
            opts.args = opts.args.split('|');
        }
        notifier.emit(body.agent, 'deploy' , {
            git,
            opts
        }); 
        this.resolve(git);
    }
];