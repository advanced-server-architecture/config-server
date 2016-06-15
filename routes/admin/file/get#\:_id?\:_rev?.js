'use strict';
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const File = require('runtime/db').File;
const Exception = require('util/exception');

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id(),
            _rev: joi.id()
        })
    }),
    function* (next) {
        const ref = this.params._id;
        const _id = this.params._rev;
        if (ref) {
            if (_id) {
                const file = yield File
                    .findOne({ ref, _id })
                    .lean()
                    .exec();
                if (!file) throw new Exception(404);
                this.resolve(file);
            } else {
                const file = yield File
                        .findOne({ ref })
                        .sort('-updatedAt')
                        .lean()
                        .exec();
                const history = yield File
                        .find({ ref })
                        .lean()
                        .sort('-updatedAt')
                        .select('_id createdAt updatedAt')
                        .exec();
                if (!file) throw new Exception(404);
                file.history = history;
                this.resolve(file);
            }
        } else {
            const files = yield File
                .aggregate([{
                    $sort: {
                        updatedAt: -1
                    }
                }, {
                    $group: {
                        _id: '$ref',
                        doc: {
                            $first: '$$ROOT'
                        }
                    }
                }])
                .exec();
            this.resolve(files.map(file => file.doc));
        }
    }
];