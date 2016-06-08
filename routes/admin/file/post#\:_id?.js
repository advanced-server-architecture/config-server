var bodyParser = require('koa-bodyparser');
var joi = require('util/joi');
var queryValidator = require('middleware/queryValidator');
var Exception = require('util/exception');
var _ = require('lodash');
var tree = require('util/tree');
var File = require('runtime/db').File;
var mongoose = require('mongoose');
var diff = require('deep-diff');
var notifier = require('runtime/notifier');

var JSONSchema = joi.array().items(
    joi.object({
        name: joi.string().required(),
        valueType: joi.string().allow(
                'object',
                'array',
                'number',
                'boolean',
                'string').required(),
        children: joi.array().items(joi.number().integer().min(1)).required(),
        value: joi.switch('valueType', {
            'object': joi.any().allow(''),
            'array': joi.any().allow(''),
            'number': joi.number().required(),
            'string': joi.string().allow('').required(),
            'boolean': joi.boolean().required(),
        }),
    })
).required().min(1)

module.exports = [
    bodyParser(),
    queryValidator({
        params: joi.object({
            _id: joi.id()
        }),
        body: joi.object({
            name: joi.string().required(),
            path: joi.string().required(),
            type: joi.string().allow('json', 'yaml', 'text').required(),
            commands: joi.array().items(joi.string()),
            content:  joi.switch('type', {
                'json': JSONSchema,
                'yaml': JSONSchema,
                'text': joi.string().required()
            }).required()
        })
    }),
    function* (next) {
        var _id = this.params._id;
        var body = this.request.body;

        if (body.type === 'json') {
            var childrenInTotal = [];
            for (var node of body.content) {
                childrenInTotal = childrenInTotal.concat(node.children);
            }
            if (_.uniq(childrenInTotal).length !== childrenInTotal.length) {
                throw new Exception(422);
            }
        }

        try {
            tree.Unflatten(body.content);
        } catch (e) {
            throw new Exception(422);
        }

        body.commands = body.commands || [];
        var file;
        if (_id) { // edit
            file = yield File.findOne({ ref: _id, active: true }).exec();
            if (!file) throw new Exception(404);
            var shadow = {};
            shadow.name = file.name;
            shadow.path = file.path;
            shadow.type = file.type;
            shadow.commands = file.commands;
            if (file.type === 'json') {
                shadow.content = file.json.map(j => ({
                    children: j.children,
                    name: j.name,
                    value: j.value,
                    valueType: j.valueType
                }));
                for (var item of shadow.content) {
                    if (item.valueType === 'object' ||
                        item.valueType === 'array') {
                        delete item.value;
                    }
                }
                for (var item of body.content) {
                    if (item.valueType === 'object' ||
                        item.valueType === 'array') {
                    } else {
                        item.value = item.value.toString();
                    }
                }
            }

            if (!diff(body, shadow)) {
                return this.resolve(file.toJSON());
            }
            file.active = false;
            var ref = file.ref;
            yield file.save();
            file = new File();
            file.active = true;
            file.ref = ref;
        } else { // new
            file = yield File.findOne({ name: body.name }).exec();
            if (file) throw new Exception(421);
            file = new File();
            file.active = true;
            file.ref = new mongoose.Types.ObjectId();
        }
        file.path = body.path;
        file.type = body.type;
        file.commands = body.commands;
        file.name = body.name;
        if (body.type === 'json' ||
            body.type === 'yaml') {
            file.json = body.content.map(node => ({
                name: node.name,
                value: node.value ? node.value.toString() : '',
                valueType: node.valueType,
                children: node.children
            }));
        } else if (body.type === 'text') {
            file.text = body.content;
        }
        yield file.save();
        notifier.publish(file.name, file);
        this.resolve(file.toObject());
    }
];