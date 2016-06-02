var ip = require('util/ip')[0];

var pad = (str, length) => {
    var result = str;
    for (var i = 0; i < length - str.length; i++) {
        result = '0' + result;
    }
    return result;
}

module.exports = function(extra) { // 26
    var seg0 = Date.now().toString(16);  // epoch 11 
    //var  
    var seg1 = '';  // ip 8
    for (var ipSeg of ip.split('.')) {
        seg1 += pad(parseInt(ipSeg).toString(16), 2);
    }
    var seg2 = pad(process.pid.toString(16), 6)  // process id 6
    var seg3 = '0';
    if (extra && Number(extra)) {
        seg3 = extra.toString(16).substr(0, 1);
    }
    return seg0 + seg1 + seg2 + seg3;
}