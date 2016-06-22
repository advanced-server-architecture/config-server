'use strict';
const Schema = require('mongoose').Schema;

module.exports = new Schema({
    agentId: Schema.Types.ObjectId,
    date: Date,
    ip: String,
    message: String,
    level: String
}, {
    collection: 'Log',
    versionKey: false
});