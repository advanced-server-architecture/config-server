'use strict';
const log4js = require('log4js');
const config = require('config')

log4js.configure({
    appenders: [{
        category: 'config-server',
        type: 'log4js-logstash',
        host: config.LOGSTASH.HOST,
        fields: {
            application: 'config-server',
            environment: config.ENV
        },
        port: config.LOGSTASH.PORT
    }, {
        category: 'console',
        type: 'console'
    }]
});


const logger = config.ENV === 'dev' ?
    log4js.getLogger('console') :
    log4js.getLogger('config-server');

module.exports = logger;