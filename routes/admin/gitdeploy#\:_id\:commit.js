var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var Git = require('runtime/db').Git;
var Exception = require('util/exception');
var notifier = require('runtime/notifier');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required(),
            commit: joi.string().required()
        })
    }),
    function* (next) {
        var _id = this.params._id;
        var git = yield Git.findOne({ _id }).exec();
        if (!git) throw new Exception(404);
        git.deployedCommit = this.params.commit;
        yield git.save();
        notifier.deploy(git); 
        this.resolve(git);
    }
];