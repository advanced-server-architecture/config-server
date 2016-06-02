var EventEmitter = require('events');
EventEmitter = EventEmitter.EventEmitter || EventEmitter;
var logger = require('runtime/logger');

var emitter = new EventEmitter();

var websocketList = {};

module.exports = {
    addWebsocket(channel, conn) {
        var id = conn.id;
        websocketList[channel] = websocketList[channel] || {};
        websocketList[channel][id] = conn;
        logger.debug('[Websocket] ' + conn.id + ' subscribed to channel "' + channel + '"');
    },
    removeWebsocket(id) {
        for (var channelKey in websocketList) {
            if (websocketList[channelKey][id]) {
                delete websocketList[channelKey][id];
                logger.debug('[Websocket] ' + id + ' exited channel "' + channelKey + '"');
            }
        }
    },
    publish(channelKey, doc) {
        var channel = websocketList[channelKey];
        for (var id in channel) {
            channel[id].emit('change', doc);
            logger.debug('[Websocket] publish to channel "' + channelKey + '", id: ' + id);
        }
    }
};