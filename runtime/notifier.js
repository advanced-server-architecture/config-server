'use strict';

let EventEmitter = require('events');
EventEmitter = EventEmitter.EventEmitter || EventEmitter;
const logger = require('runtime/logger');
const emitter = new EventEmitter();

let clients = {};

module.exports = {
    online(conn, config) {
        conn.uid = config.uid;
        const uid = config.uid;
        clients[uid] = clients[uid] || {};
        clients[uid].online = true;
        clients[uid].lastOnline = Date.now();
        clients[uid].conn = conn;
        clients[uid].ip = conn.handshake.address
        clients[uid].name = config.name;
        conn.on('return', (id, result) => {
            emitter.emit(id ,result);
        });
    },
    offline(uid) {
        if (clients[uid]) {
            clients[uid].online = false;
            clients[uid].lastOnline = Date.now();
        }
    },
    emit(uid, command, params) {
        if (clients[uid] && clients[uid].online) {
            clients[uid].conn.emit('command', command, params);
            let p = JSON.stringify(params, 0, 2);
            p = p.substr(0, Math.min(p.length, 20));
            logger.debug(`Command(${uid}): ${command} ${p}`);
        }
    },
    list() {
        let result = [];
        for (const uid in clients) {
            const c = clients[uid];
            result.push({
                uid,
                online: c.online,
                lastOnline: c.lastOnline,
                name: c.name,
                ip: c.ip
            });
        }
        return result;
    },
    get(uid, type, params){
        return new Promise((resolve, reject) => {
            if (clients[uid]) {
                if (clients[uid].online) {
                    const id = Date.now();
                    emitter.once(id, result => {
                        resolve(result);
                    });
                    clients[uid].conn.emit('get', id, uid, type, params);
                } else {
                    resolve([]);
                }
            } else {
                reject(new Error(`uid ${uid} not found`));
            }
        });
    }
};