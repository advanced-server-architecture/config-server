var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var File = require('runtime/db').File;
var Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        })
    }),
    function* (next) {
        var _id = this.params._id;
        var file = yield File.findOne({ _id });
        if (!file) throw new Exception(404);
        yield file.remove();
        this.resolve(_id);
    }
];