'use strict';
const Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    content: String,
    ref: String,
    from: Schema.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}, {
    collection: 'File',
    versionKey: false
});