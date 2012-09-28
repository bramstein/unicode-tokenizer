var util = require('util'),
    Stream = require('stream').Stream,
    types = require('./TokenType'),
    tokens = require('./tokens'),
    tokenClasses = Object.keys(tokens),
    tokenRegExp = {};

tokenClasses.forEach(function(tokenClass) {
     tokenRegExp[tokenClass] = new RegExp('^(' + tokens[tokenClass] + ')+');
});

function tokenizeSync(str) {
    var result = [];

    while (str) {
        var found = false;

        for (var i = 0; i < tokenClasses.length; i += 1) {
            var type = tokenClasses[i],
                m = tokenRegExp[type].exec(str);

            if (m) {
                var token = m[0];
                result.push({
                    token: token,
                    type: types[type]
                });
                str = str.substring(token.length);
                found = true;
            }
        }

        if (!found) {
            result.push({
                token: str,
                type: types.XX
            });
            break;
        }
    }
    return result;
};

function tokenize(str, callback) {
    var result = [];

    while (str) {
        var found = false;

        for (var i = 0; i < tokenClasses.length; i += 1) {
            var type = tokenClasses[i],
                m = tokenRegExp[type].exec(str);

            if (m) {
                var token = m[0];
                callback(token, types[type]);
                str = str.substring(token.length);
                found = true;
            }
        }

        if (!found) {
            callback(str, types['XX']);
            break;
        }
    }
}

function Tokenizer() {
    Stream.call(this);
    this.readable = true;
    this.writable = true;
}

util.inherits(Tokenizer, Stream);

Tokenizer.prototype.write = function(chunk) {
    var that = this;

    tokenize(chunk.toString('utf8'), function(token, type) {
        that.emit('data', token);
        that.emit('token', token, type);
    });
};

Tokenizer.prototype.end = function(data) {
    if (data) {
        this.write(data);
    }
    this.emit('end');
};

module.exports = {
    Tokenizer: Tokenizer,
    createTokenizer: function() {
        return new Tokenizer();
    },
    tokenize: tokenize,
    tokenizeSync: tokenizeSync
};
