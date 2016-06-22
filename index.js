'use strict';
require('app-module-path/register');
const koa = require('koa');
const config = require('config');
const logger = require('runtime/logger');
const db = require('runtime/db');
const co = require('co');
const _ = require('lodash');
const routeLoader = require('util/routeLoader');

const app = koa();

app.use(function* (next) {
    this.send = (body) => {
        this.body = JSON.stringify(body);
        this.type = 'json';
        this.status = 200;
    };
    this.resolve = (result) => {
        result = Array.isArray(result) ? result : [result];
        this.send({
            data: result
        });
    };
    this.reject = (code, message, extra) => {
        let error = {
            code, 
            message
        };

        if (extra) {
            error.extra = extra;
        }

        this.send({
            error: [error]
        });
    };
    this.set('Access-Control-Allow-Origin', this.headers['origin'] || '');
    this.set('Access-Control-Allow-Credentials', 'true');
    this.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    this.set('Access-Control-Allow-Headers', 'Content-Type, Cookie');
    yield next;
});


app.use(function* (next) {
    try {
        yield next;
    } catch (e) {
        if (e.runtime) {
            this.reject(e.code, e.message, e.extra);
        } else {
            logger.error(e);
            this.reject(500, 'Internal');
        }
    }
});




const router = routeLoader('./routes');

app.use(router.routes());
app.use(router.allowedMethods());



app.listen(config.HTTP_PORT, err => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }
    logger.info(`Server started on port:${config.HTTP_PORT}`);
});

require('websocket');