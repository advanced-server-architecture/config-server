var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var bodyParser = require('koa-bodyparser')
var Git = require('runtime/db').Git;
var Exception = require('util/exception');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id()
        }),
        body: joi.object({
            name: joi.string().required(),
            accessToken: joi.string().required(),
            repo: joi.string().required(),
            command: joi.string().allow(''),
            path: joi.string().required(),
            username: joi.string().required()
        })
    }),
    function* (next) {
        var git;
        var _id = this.params._id;
        var body = this.request.body;
        if (_id) {
            git = yield Git.findOne({ _id }).exec();
            if (!git) throw new Exception(404);
        } else {
            git = yield Git.findOne({ name: body.name }).exec();
            if (git) throw new Exception(421);
            git = new Git();
        }
        git.name = body.name;
        git.accessToken = body.accessToken;
        git.username = body.username;
        git.repo = body.repo;
        git.path = body.path;
        git.command = body.command || '';
        yield git.save();
        this.resolve(git);
    }
];