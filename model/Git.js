var Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    accessToken: String,
    repo: String,
    command: String,
    deployedCommit: String,
    path: String,
    username: String
}, {collection: 'Git'});