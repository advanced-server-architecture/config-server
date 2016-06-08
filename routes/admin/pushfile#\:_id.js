'use stirct';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');
const tree = require('util/tree');
const File = require('runtime/db').File;
const notifier = require('runtime/notifier');


module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id().required()
        })
    }),
    function* (next) {
        const _id = this.params._id;
        const file = yield File.findOne({ _id, active: true });
        if (!file) throw new Exception(404);
        //notifier.publish(file.name, file);
        this.resolve([]);
    }
];