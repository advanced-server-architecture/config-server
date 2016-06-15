var Schema = require('mongoose').Schema;

module.exports = new Schema({
    accessToken: String,
    repo: String,
    command: [String],
    username: String,
    argument: [String],
    main: String
}, {
    collection: 'Project',
    timestamps: true
});