'use strict';

const config = require('config');
const logger = require('runtime/logger');
const notifier = require('runtime/notifier');
const io = require('socket.io')();
const co = require('co');

io.on('connection', conn => {
    logger.debug(`[Websocket] Received connection from: ${conn.handshake.address}, id: ${conn.id}`);
    conn.on('online', config => {
        co(function* () {
            const client = yield notifier.online(conn, config)
            conn.emit('_id', client._id);
            logger.debug(`[Websocket] Agent ${client._id} went online`);
            yield cb => client.on('disconnect', cb.bind({}, null));
            yield notifier.offline(client._id)
            logger.debug(`[Websocket] Agent ${client._id} went offline`);
        })
        .catch(e => {
            if (e.stack) {
                logger.error(e.stack);
            } else {
                logger.error(e);
            }
        });
    });

});

io.listen(config.WEBSOCKET.PORT);