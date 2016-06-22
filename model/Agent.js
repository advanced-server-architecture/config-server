'use strict';
const Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    ip: String,
    command: [{
        command: String,
        argument: Schema.Types.Mixed
    }],
    online: Boolean,
    info: {
        processSummary: {
            total: Number,
            running: Number,
            stopped: Number,
            sleeping: Number
        },
        cpu: {
            user: Number,
            sys: Number,
            idle: Number
        },
        processList: [{
            cpu: Number,
            memory: Number,
            upHour: String,
            upUnit: String,
            upMinute: String,
            command: String,
            pid: Number
        }],
        memory: {
            total: Number,
            free: Number
        }
    },
    project: [{
        createdAt: Date,
        updatedAt: Date,
        status: String,
        git: {
            commit: String,
            repo: String,
            accessToken: String,
            username: String
        },
        main: String,
        restartCount: Number,
        location: String,
        opts: Schema.Types.Mixed,
        name: String,
        pid: Number,
        _id: Schema.Types.ObjectId
    }],
    file: [{
        createdAt: Date,
        content: String,
        updatedAt: Date,
        name: String,
        location: String,
        _id: Schema.Types.ObjectId,
        ref: Schema.Types.ObjectId,
    }],
    version: String
}, {
    collection: 'Agent',
    timestamps: true,
    versionKey: false
});