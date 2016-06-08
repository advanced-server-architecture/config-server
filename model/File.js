var Schema = require('mongoose').Schema;

module.exports = new Schema({
    name: String,
    path: String,
    type: String,
    commands: [String],
    json: [{
        name: String,
        valueType: String,
        children: [Number],
        value: String
    }],
    text: String,
    active: Boolean,
    ref: String
}, {
    collection: 'File',
    timestamps: true
});