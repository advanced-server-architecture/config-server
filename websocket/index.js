'use strict';

const config = require('config');
const logger = require('runtime/logger');
const notifier = require('runtime/notifier');
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
});

io.listen(config.WS_PORT);