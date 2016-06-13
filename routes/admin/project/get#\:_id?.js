'use strict';
const Project = require('runtime/db').Project;
const Exception = require('util/exception')
var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');;

module.exports = [
    queryValidator({
        params: joi.object({
            _id: joi.id()
        })
    }),
    function* (next) {
        const _id = this.params._id;
        if (!_id) {
            const projects = yield Project.find({}).exec();
            this.resolve(projects);
        } else {
            const project = yield Project
                .findOne({ _id })
                .lean()
                .exec();
            if (!project) {
                throw new Exception(404);
            }
            this.resolve(project);
        }
    }
];