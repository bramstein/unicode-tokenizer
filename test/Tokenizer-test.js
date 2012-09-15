var vows = require('vows'),
    assert = require('assert'),
    Stream = require('stream').Stream,
    Tokenizer = require('../lib/Tokenizer');

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
    var tokenizer = new Tokenizer(),
        that = this,
        results = [];

    tokenizer.on('token', function(token, tokenClass) {
        results.push(arguments);
    });

    tokenizer.on('end', function() {
        callback(null, results);
    });

    tokenizer.write(str);
    tokenizer.end();
}

vows.describe('Tokenizer').addBatch({
    'is a stream': {
        topic:  new Tokenizer(),
        'has the correct methods': function(tokenizer) {
            assert.instanceOf(tokenizer, Stream);
            assert.include(tokenizer.prototype, 'end');
            assert.include(tokenizer.prototype, 'pipe');
            assert.include(tokenizer.prototype, 'write');
            assert.include(tokenizer.prototype, 'resume');
            assert.include(tokenizer.prototype, 'pause');
        },
        'readable and writable': function(tokenizer) {
            assert.isTrue(tokenizer.readable);
            assert.isTrue(tokenizer.writable);
        }
    },
    'tokenizes in a single chunk': {
        topic: function() {
            var tokenizer = new Tokenizer(),
                generator = null,
                that = this,
                results = [];

            tokenizer.on('token', function() {
                results.push(arguments);
            });

            tokenizer.on('end', function() {
                that.callback(null, results);
            });
            generator = createTestStream(['a', '1', '!', ' '], 10);
            generator.pipe(tokenizer);
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
            assert.equal(results[0][1], Tokenizer.Type.AL);
            assert.equal(results[1][1], Tokenizer.Type.NU);
            assert.equal(results[2][1], Tokenizer.Type.EX);
            assert.equal(results[3][1], Tokenizer.Type.SP);
        }
    },
    'tokenizes over multiple chunks': {
        topic: function() {
            var stream = new Tokenizer(),
                that = this,
                generator = null,
                results = [];

            stream.on('token', function() {
                results.push(arguments);
            });

            stream.on('end', function() {
                that.callback(null, results);
            });
            generator = createTestStream(['hello world!'], 10);
            generator.pipe(stream);
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
            assert.equal(results[0][1], Tokenizer.Type.AL);
            assert.equal(results[1][1], Tokenizer.Type.SP);
            assert.equal(results[2][1], Tokenizer.Type.AL);
            assert.equal(results[3][1], Tokenizer.Type.EX);
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
            var tokenizer = new Tokenizer(),
                that = this;

            tokenizer.on('token', function(token, tokenClass) {
                that.callback(null, [token, tokenClass]);
            });
            tokenizer.write('\uD834\uDF06');
        },
        'received one token': function(err, results) {
            assert.isNotNull(results);
        },
        'token correctly classified as SG': function(err, results) {
            assert.equal(results[1], Tokenizer.Type.SG);
        }
    },
    'handles tokens outside what the tokenizer is built for': {
        topic: function() {
            var tokenizer = new Tokenizer(),
                that = this;

            tokenizer.on('token', function(token, tokenClass) {
                that.callback(null, [token, tokenClass]);
            });
            tokenizer.write('\uF8FF');
        },
        'received one token': function(err, results) {
            assert.isNotNull(results);
        },
        'token correctly classified as unknown': function(err, results) {
            assert.equal(results[1], Tokenizer.Type.XX);
        }
    }
}).export(module);
