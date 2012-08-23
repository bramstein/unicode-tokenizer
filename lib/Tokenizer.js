var util = require('util'),
    Stream = require('stream').Stream,
    tokens = require('./tokens'),
    tokenClasses = Object.keys(tokens),
    tokenRegExp = {};

tokenClasses.forEach(function(tokenClass) {
     tokenRegExp[tokenClass] = new RegExp('^(' + tokens[tokenClass] + ')+');
});

function Tokenizer() {
    Stream.call(this);
    this.readable = true;
    this.writable = true;
}

util.inherits(Tokenizer, Stream);

Tokenizer.prototype.write = function(chunk) {
    var str = chunk.toString('utf8');

    while (str) {
        var found = false;

        for (var i = 0; i < tokenClasses.length; i += 1) {
            var tokenClass = tokenClasses[i],
                m = tokenRegExp[tokenClass].exec(str);

            if (m) {
                var token = m[0];
                this.emit('data', token, Tokenizer.TokenClass[tokenClass]);
                str = str.substring(token.length);
                found = true;
            }
        }

        if (!found) {
            this.emit('data', str, Tokenizer.TokenClass.XX);
            break;
        }
    }
};

Tokenizer.prototype.end = function() {
    this.emit('end');
};

Tokenizer.TokenClass = {
    OP: 0,
    CL: 1,
    CP: 2,
    QU: 3,
    GL: 4,
    NS: 5,
    EX: 6,
    SY: 7,
    IS: 8,
    PR: 9,
    PO: 10,
    NU: 11,
    AL: 12,
    HL: 13,
    ID: 14,
    IN: 15,
    HY: 16,
    BA: 17,
    BB: 18,
    B2: 19,
    ZW: 20,
    CM: 21,
    WJ: 22,
    H2: 23,
    H3: 24,
    JL: 25,
    JV: 26,
    JT: 27,

    // Non-standard
    SP: 28,
    LF: 29,
    NL: 30,
    BK: 31,
    CR: 32
};

module.exports = Tokenizer;