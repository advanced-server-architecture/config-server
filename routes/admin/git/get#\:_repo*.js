var Git = require('runtime/db').Git;

module.exports = [
    function* (next) {
        var name = this.params._repo;
        if (!name) {
            var gits = yield Git.find({}).exec();
            this.resolve(gits);
        } else {
            var git = yield Git.findOne({ name: name }).exec();
            git = git || [];
            this.resolve(git);
        }
    }
];