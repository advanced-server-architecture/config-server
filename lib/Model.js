var db = require('runtime/db');
var Schema = require('schema-object');
var uuid = require('util/uuid');
var _ = require('lodash');

module.exports = ModelConstructor;

function ModelConstructor(type, schema, ...extras) {
    schema._id = String;
    var Model = new Schema(schema, {
        strict: true,
        methods: {
            save: function *() {
                var flag = false;
                if (!this._id) {
                    this._id = uuid();
                    flag = true;
                }
                var body = this.toObject();
                var list = yield cb => db.get(type + ':' + '__id__', cb);
                var extraList = {};
                for (var extra of extras) {
                    extraList[extra] = (yield cb => db.get(type + ':__' + extra + '__', cb)) || {};
                }
                list = list || [];
                if (flag) {
                    list.push(body._id);
                    for (var extra of extras) {
                        extraList[extra][body[extra]] = extraList[extra][body[extra]] || [];
                        extraList[extra][body[extra]].push(body._id);
                    }
                }
                db = db
                    .batch()
                    .put(type + ':' + body._id, body)
                    .put(type + ':' + '__id__', list)

                for (var extra of extras) {
                    db = db.put(type + ':__' + extra + '__', extraList[extra]);
                }
                
                yield cb => db.write(cb);
            },
            remove: function*() {
                if (this._id) {
                    var list = yield cb => db.get(type + ':' + '__id__', cb);
                    list = list || [];
                    var index = list.indexOf(this._id);
                    if (index === -1) return reject('_id not found');
                    list.splice(index, 1);
                    db = db
                        .batch()
                        .put(type + ':' + '__id__', list)
                        .del(type + ':' + this._id)

                    yield cb => db.write(cb);
                } 
            }
        }
    });
    
    Model.get = function *(id) {
        var item = yield cb => db.get(type + ':' + id, cb);
        if (!item) return null;
        return new Model(item);
    };

    Model.find = function *(cond) {
        var result = [];
        var tmp; 
        for (var key in cond) {
            var list = yield cb => db.get(type + ':__' + key + '__', cb);
            list = list || {};
        }
    };

    Model.all = function *() {
        var list = yield cb => db.get(type + ':' + '__id__', cb);
        list = list || [];
        var result = [];
        for (var extra of extras) {
            console.log(yield cb => db.get(type + ':__' + extra + '__', cb));
        }
        for (var id of list) {
            var i = yield Model.get(id);
            if (i) {
                result.push(i);
            }
        }
        return result;
    };

    return Model; 
}