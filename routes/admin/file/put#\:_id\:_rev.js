var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var Exception = require('util/exception');
var _ = require('lodash');
var File = require('runtime/db').File;
var notifier = require('runtime/notifier');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required(),
            _rev: joi.id().required()
        }),
    }),
    function* (next) {
        var ref = this.params._id;
        var _id = this.params._rev; 
        var file = yield File.findOne({ ref, active: true}).exec();
        if (file._id === _id) throw new Exception(421);
        file.active = false;
        yield file.save();
        file = yield File.findOne({ ref, _id }).exec();
        file.active = true;
        yield file.save();
        file = file.toJSON();
        file.commands = file.commands || [];
        notifier.publish(file.name, file);
        this.resolve(file);
    }
];