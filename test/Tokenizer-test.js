var vows = require('vows'),
    assert = require('assert'),
    Stream = require('stream').Stream,
    tokenizer = require('../lib/tokenizer'),
    TokenType = require('../lib/TokenType');

function createTestStream(chunks, interval) {
    var stream = new Stream(),
        index = 0,
        intervalId = null;

    intervalId = setInterval(function() {
        if (index < chunks.length) {
            stream.emit('data', chunks[index]);
            index += 1;
        } else {
            stream.emit('end');
            clearTimeout(intervalId);
        }
    }, interval);

    return stream;
}

function tokenize(str, callback) {
    var t = tokenizer.createTokenizer(),
        that = this,
        results = [];

    t.on('token', function(token, tokenClass) {
        results.push(arguments);
    });

    t.on('end', function() {
        callback(null, results);
    });

    t.write(str);
    t.end();
}

vows.describe('Tokenizer').addBatch({
    'is a stream': {
        topic:  tokenizer.createTokenizer(),
        'has the correct methods': function(t) {
            assert.instanceOf(t, Stream);
            assert.include(t.prototype, 'end');
            assert.include(t.prototype, 'pipe');
            assert.include(t.prototype, 'write');
            assert.include(t.prototype, 'resume');
            assert.include(t.prototype, 'pause');
        },
        'readable and writable': function(t) {
            assert.isTrue(t.readable);
            assert.isTrue(t.writable);
        }
    },
    'tokenizes in a single chunk': {
        topic: function() {
            var t = tokenizer.createTokenizer(),
                generator = null,
                that = this,
                results = [];

            t.on('token', function() {
                results.push(arguments);
            });

            t.on('end', function() {
                that.callback(null, results);
            });
            generator = createTestStream(['a', '1', '!', ' '], 10);
            generator.pipe(t);
        },
        'received four tokens': function(err, results) {
            assert.lengthOf(results, 4);
        },
        'tokenized correctly': function(err, results) {
            assert.equal(results[0][0], 'a');
            assert.equal(results[1][0], '1');
            assert.equal(results[2][0], '!');
            assert.equal(results[3][0], ' ');
        },
        'have the correct token class': function(err, results) {
            assert.equal(results[0][1], TokenType.AL);
            assert.equal(results[1][1], TokenType.NU);
            assert.equal(results[2][1], TokenType.EX);
            assert.equal(results[3][1], TokenType.SP);
        }
    },
    'tokenizes over multiple chunks': {
        topic: function() {
            var t = tokenizer.createTokenizer(),
                that = this,
                generator = null,
                results = [];

            t.on('token', function() {
                results.push(arguments);
            });

            t.on('end', function() {
                that.callback(null, results);
            });
            generator = createTestStream(['hello world!'], 10);
            generator.pipe(t);
        },
        'received four tokens': function(err, results) {
            assert.lengthOf(results, 4);
        },
        'tokenized correctly': function(err, results) {
            assert.equal(results[0][0], 'hello');
            assert.equal(results[1][0], ' ');
            assert.equal(results[2][0], 'world');
            assert.equal(results[3][0], '!');
        },
        'have the correct token class': function(err, results) {
            assert.equal(results[0][1], TokenType.AL);
            assert.equal(results[1][1], TokenType.SP);
            assert.equal(results[2][1], TokenType.AL);
            assert.equal(results[3][1], TokenType.EX);
        }
    },
    'parentheses': {
        topic: function() {
            tokenize("require('file');", this.callback);
        },
        'received seven tokens': function(err, results) {
            assert.lengthOf(results, 7);
        }
    },
    'angle brackets (AL, AL)': {
        topic: function() {
            tokenize('<b', this.callback);
        },
        'received one token': function(err, results) {
            assert.lengthOf(results, 1);
        }
    },
    'handles surrogate pairs': {
        topic: function() {
            var t = tokenizer.createTokenizer(),
                that = this;

            t.on('token', function(token, tokenClass) {
                that.callback(null, [token, tokenClass]);
            });
            t.write('\uD834\uDF06');
        },
        'received one token': function(err, results) {
            assert.isNotNull(results);
        },
        'token correctly classified as SG': function(err, results) {
            assert.equal(results[1], TokenType.SG);
        }
    },
    'handles tokens outside what the tokenizer is built for': {
        topic: function() {
            var t = tokenizer.createTokenizer(),
                that = this;

            t.on('token', function(token, tokenClass) {
                that.callback(null, [token, tokenClass]);
            });
            t.write('\uF8FF');
        },
        'received one token': function(err, results) {
            assert.isNotNull(results);
        },
        'token correctly classified as unknown': function(err, results) {
            assert.equal(results[1], TokenType.XX);
        }
    }
}).export(module);
