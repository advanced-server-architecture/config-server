var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var Exception = require('util/exception');
var tree = require('util/tree');
var File = require('runtime/db').File;
var notifier = require('runtime/notifier');


module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        })
    }),
    function* (next) {
        var _id = this.params._id;
        var file = yield File.find({ _id, active: true });
        if (!file) throw new Exception(404);
        notifier.publish(file.name, file);
        this.resolve([]);
    }
];