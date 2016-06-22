var errors = {
    '403': 'Access Denied',
    '404': 'Not Found',
    '422': '格式错误',
    '421': 'Conflict',
    '408': 'Timeout',
    '1001': 'Call Error'
};
function Exception(code, extra) {
    this.code = code;
    this.message = errors[code.toString()] || 'Unknown Error';
    this.runtime = true;
    this.exception = true;
    this.stack = (new Error()).stack;
    this.extra = extra;
}

module.exports = Exception;
