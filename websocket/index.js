'use strict';

const config = require('config');
const logger = require('runtime/logger');
const notifier = require('runtime/notifier');
const Log = require('runtime/db').Log;
const Git = require('runtime/db').Git;
const io = require('socket.io')();

io.on('connection', conn => {
    logger.debug(`[Websocket] Received connection from: ${conn.handshake.address}, id: ${conn.id}`);
    conn.on('online', config => {
        notifier.online(conn, config);
        logger.debug(`[Websocket] Agent ${conn.uid} went online`);
    });
    conn.on('disconnect', () => {
        notifier.offline(conn.uid);
        logger.debug(`[Websocket] Agent ${conn.uid} went offline`);
    });
    conn.on('log', (level, message) => {
        let log = new Log();
        log.uid = conn.uid;
        log.level = level;
        log.message = message;
        log.save().catch(e => {
            logger.error(e);
        });
    });
    conn.on('deployed', (_id) => {
        Git
            .findOne({ _id })
            .exec()
            .then(git => {
                if (git) {
                    logger.debug(`[Agent] Project:${_id} deployed on ${git.commit}`);
                    git.status = 'Deployed';
                    return git.save();
                }
            })
            .catch(e => {
                logger.error(e);
            })
    });
});

io.listen(config.WS_PORT);