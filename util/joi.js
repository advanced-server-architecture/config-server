var joi = require('joi');

joi.id = () => joi.string().hex().length(24);

var _multi = (ref, current, remain, fail) => {
    var opts = {
        is: current.key,
        then: current.value,
        otherwise: fail
    };
    if (remain.length > 0) {
        var curr = remain.pop();
        opts.otherwise = _multi(ref, curr, remain, fail);
    }
    return joi.alternatives().when(ref, opts);
};

joi.switch = (ref, cond, fail) => {
    fail = fail || joi.forbidden();
    var arr = [];
    for (var key in cond) {
        arr.push({key, value: cond[key]});
    }
    var curr = arr.pop();
    return _multi(ref, curr, arr, fail);
};

module.exports = joi;