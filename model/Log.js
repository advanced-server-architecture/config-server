var Schema = require('mongoose').Schema;

module.exports = new Schema({
    uid: String,
    level: String,
    message: String
}, {
    timestamps: true,
    collection: 'Log'
});