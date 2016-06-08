var Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    accessToken: String,
    repo: String,
    command: String,
    username: String,
    status: String,
    commit: String,
    main: String
}, {
    collection: 'Git',
    timestamps: true
});