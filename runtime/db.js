var fs = require('fs');
var mongoose = require('mongoose');
var path = require('path');
var config = require('config');


mongoose.connect(config.MONGODB);
var models = {};
var files = fs.readdirSync('./model');
for (var file of files) {
    var name = path.basename(file).slice(0, -3);
    models[name] = mongoose.model(name, require('model/' + file));
}

module.exports = models;