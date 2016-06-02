var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var File = require('runtime/db').File;
var Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id(),
            _rev: joi.id()
        })
    }),
    function* (next) {
        var ref = this.params._id;
        var _id = this.params._rev;
        if (ref) {
            if (_id) {
                var file = yield File.findOne({ ref, _id }).exec();
                if (!file) throw new Exception(404);
                file = file.toJSON();
                file.commands = file.commands || [];
                this.resolve(file);
            } else {
                var file = yield File.findOne({ ref, active: true }).exec();
                var history = yield File.find({ ref }).sort('-createTime').select('_id active createTime').exec();
                if (!file) throw new Exception(404);
                file = file.toJSON();
                file.commands = file.commands || [];
                file.history = history;
                this.resolve(file);
            }
        } else {
            var files = yield File.find({ active: true }).exec();
            files = (files || []).map(f => f.toJSON())
            files = files.map(f => ({
                name: f.name,
                type: f.type,
                ref: f.ref
            }));
            this.resolve(files);
        }
    }
];