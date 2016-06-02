require('app-module-path/register');
var fs = require('fs');
var koa = require('koa');
var Router = require('koa-router');
var config = require('config');
var logger = require('runtime/logger');
var db = require('runtime/db');
var co = require('co');
var _ = require('lodash');

var app = koa();

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
        this.send({
            error: [_.extend({
                code,
                message
            }, extra || {})]
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


function walk(dir) {
    var files = fs.readdirSync(dir);
    var list = [];
    for (var file of files) {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            list = list.concat(walk(dir + '/' + file));
        } else {
            list.push(dir + '/' + file);
        }
    }
    return list;
}

var routes = walk('./routes');
routes = routes.map(r => r.substr(8, r.length - 11));

var router = new Router();

for (var route of routes) {
    var paths = route.split('/');
    var name = paths[paths.length - 1].split('#');
    var method = name[0];
    var url = route;
    if (name.length > 1) {
        paths.pop();
        url = paths.join('/');
    }
    if (['post', 'get', 'put', 'del'].indexOf(method) !== -1) {
    } else {
        url += '/' + method;
        method = 'get';
    }
    var query = name[1];
    var r = require('./routes/' + route);
    if (query) {
        query = query.replace(/\\/g,'/');
        url = url + query;
    }
    logger.info('  ', method, url);
    router[method](url, ...r);
    
}


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