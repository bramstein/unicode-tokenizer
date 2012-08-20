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
                this.emit('data', tokenClass, token);
                str = str.substring(token.length);
                found = true;
            }
        }

        if (!found) {
            this.emit('data', 'XX', str);
            break;
        }
    }
};

Tokenizer.prototype.end = function() {
    this.emit('end');
};

module.exports = Tokenizer;
