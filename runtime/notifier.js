'use strict';

let EventEmitter = require('events');
EventEmitter = EventEmitter.EventEmitter || EventEmitter;
const logger = require('runtime/logger');
const emitter = new EventEmitter();
const Exception = require('util/exception');
const Agent = require('runtime/db').Agent;
const Log = require('runtime/db').Log;
const uuid = require('util/uuid');
const config = require('config');
const co = require('co');

let connectionList = {};

module.exports = {
    online: function* (conn, config) {
        let agent;
        if (config._id && config._id.length === 24) {
            agent = yield Agent
                .findOne({ _id: config._id })
                .exec();
            if (!agent) {
                agent = new Agent();
            }
        } else {
            agent = new Agent();
        }

        connectionList[agent._id] = conn;

        agent.online = true;
        agent.ip = conn.handshake.address;
        agent.name = config.name;
        agent.version = config.version;



        try {
            for (const command of agent.command) {
                yield this.call(agent._id, command.command, command.argument);
            }
        } catch (e) {

        }
        logger.info(`Retryied ${agent.command.length} commands`);
        agent.command = [];
        yield agent.save();

        conn._id = agent._id;

        conn.on('callback', (callId, err ,res) => {
            emitter.emit(callId, err, res);
        });

        conn.on('updateInfo', (infoType, info) => {
            this.updateInfo(agent._id, infoType, info)
                .catch(e => {
                    if (e.stack) {
                        logger.error(e.stack)
                    } else {
                        logger.error(e);
                    }
                });
        });

        return conn;
    },
    offline: function* (_id) {
        let agent = yield Agent
            .findOne({ _id })
            .exec();
        agent.online = false;
        delete connectionList[_id];
        yield agent.save();
    },
    call: function* (_id, command, argument) {
        logger.debug(`Agent#${_id}  ${command}`);
        if (!connectionList[_id]) {
            let agent = yield Agent
                    .findOne({ _id })
                    .exec();
            if (!agent) {
                throw new Exception(404);
            }
            agent.command.push({
                command,
                argument
            });
            yield agent.save();
            return `Agent#${agent._id} is offline, command cached`;
        } else {
            const callId = uuid();
            connectionList[_id].emit('call', callId, command, argument);
            return yield cb => {
                const timer = setTimeout(() => {
                    emitter.removeListener(callId, listener);
                    cb(new Exception(408));
                }, config.WEBSOCKET.TIMEOUT);
                emitter.once(callId, listener);
                function listener(err, retVal) {
                    clearTimeout(timer);
                    if (err) {
                        return cb(new Exception(1001, err));
                    }
                    cb(null, retVal);
                }

            }
        }
    },
    updateInfo(_id, infoType, info) {
        return co(function* () {
            let agent = yield Agent
                .findOne({ _id })
                .exec();
            if (!agent) throw `agent#${_id} not found`;
            switch(infoType) {
                case 'machine':
                    agent.info.cpu = info.cpu;
                    agent.info.memory = info.memory;
                    agent.info.processList = info.list || [];
                    agent.info.processSummary = info.process;
                    break;
                case 'project':
                    agent.project = info;
                    break;
                case 'file':
                    agent.file = info;
                    break;
                case 'log':
                    let log = new Log();
                    log.agentId = _id;
                    log.date = info.date;
                    log.ip = agent.ip;
                    log.message = info.message;
                    log.level = info.level;
                    yield log.save();
                    break;
                default:
                    throw `infoType ${infoType} not recognized`;
            }
            yield agent.save();
        });
    }
};