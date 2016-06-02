var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var File = require('runtime/db').File;
var Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            name: joi.string().required()
        })
    }),
    function* (next) {
        var name = this.params.name;
        name = '/' + name;
        var file = yield File.findOne({ name, active: true }).exec();
        if (!file) throw new Exception(404);
        file = file.toJSON();
        file.commands = file.commands || [];
        this.resolve(file);
    }
];