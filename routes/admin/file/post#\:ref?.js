'use strict';
const bodyParser = require('koa-bodyparser');
const joi = require('util/joi');
const queryValidator = require('middleware/queryValidator');
const Exception = require('util/exception');
const _ = require('lodash');
const File = require('runtime/db').File;
const mongoose = require('mongoose');

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            ref: joi.id()
        }),
        body: joi.object({
            name: joi.string(),
            content:  joi.string().required(),
            from: joi.id()
        })
    }),
    function* (next) {
        const body = this.request.body;
        const ref = this.params.ref;
        let file = new File();
        if (ref) {
            const oldFile = yield File
                        .findOne({ref})
                        .lean()
                        .exec();
            if (!oldFile) {
                throw new Exception(404);
            }
            if (!body.from) {
                throw new Exception(421);
            }
            file.ref = oldFile.ref;
            file.content = body.content;
            file.name = oldFile.name
            file.from = body.from;
            file.createdAt = oldFile.createdAt;
            file.updatedAt = new Date();
        } else {
            if (yield File.findOne({ name: body.name }).lean().exec()) {
                throw new Exception(421);
            }
            if (!body.name || body.name === '') {
                throw new Exception(421);
            }
            file.name = body.name;
            file.content = body.content;
            file.ref = new mongoose.Types.ObjectId();
            file.createdAt = new Date();
            file.updatedAt = new Date();
        }
        yield file.save();
        this.resolve(file);
    }
];