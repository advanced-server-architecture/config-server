var config = require('config');
var logger = require('runtime/logger');
var notifier = require('runtime/notifier');

var io = require('socket.io')();

io.on('connection', conn => {
    logger.debug('[Websocket] received connection from: ' + conn.handshake.address + ', id:' + conn.id);
    conn.on('watch', channel => {
        notifier.addWebsocket(channel, conn);
    });
    conn.on('disconnect', () => {
        notifier.removeWebsocket(conn.id);
    });
});

io.listen(config.WS_PORT);