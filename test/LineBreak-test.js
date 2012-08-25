var vows = require('vows'),
    assert = require('assert'),
    Stream = require('stream').Stream,
    Tokenizer = require('../lib/Tokenizer'),
    LineBreak = require('../lib/LineBreak');

function createInput(tokens) {
    return function() {
        var that = this,
            lineBreak = new LineBreak(),
            result = [];

        lineBreak.on('action', function(token, tokenClass, breakAction) {
            result.push([token, tokenClass, breakAction]);
        });

        lineBreak.on('end', function() {
            that.callback(null, result);
        });

        tokens.forEach(function(token) {
            lineBreak.process(token[0], token[1]);
        });

        lineBreak.end();
    };
}

function breakAs(breaks) {
    return function(result) {
        assert.deepEqual(result, breaks);
    };
}

vows.describe('LineBreak').addBatch({
    'handles empty input': {
        topic: createInput([]),
        'empty result set': function(result) {
            assert.lengthOf(result, 0);
        }
    },
    'handles a single token': {
        topic: createInput([[1, Tokenizer.Type.SP]]),
        'correct number of tokens': function(result) {
            assert.lengthOf(result, 1);
        },
        'correct token, tokenClass and break action': function(result) {
            assert.equal(result[0][0], 1);
            assert.equal(result[0][1], Tokenizer.Type.SP);
            assert.equal(result[0][2], LineBreak.Type.EXPLICIT);
        }
    },
    'handles two tokens': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.AL]
        ]),
        'correct number of tokens': function(result) {
            assert.lengthOf(result, 2);
        },
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [2, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    },
    'handles direct breaks (AL, B2, AL)': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.B2],
            [3, Tokenizer.Type.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.DIRECT],
            [2, Tokenizer.Type.B2, LineBreak.Type.DIRECT],
            [3, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    },
    'handles explicit breaks (AL, NL, AL, AL)': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.NL],
            [3, Tokenizer.Type.AL],
            [4, Tokenizer.Type.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [2, Tokenizer.Type.NL, LineBreak.Type.EXPLICIT],
            [3, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [4, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    },
    'handles prohibited breaks (AL, AL, AL)': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.AL],
            [3, Tokenizer.Type.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [2, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [3, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    },
    'handles soft hyphens (AL, BA, AL, AL)': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.BA],
            [3, Tokenizer.Type.AL],
            [4, Tokenizer.Type.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [2, Tokenizer.Type.BA, LineBreak.Type.DIRECT],
            [3, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [4, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    },
    'handles question marks (AL, EX, SP, AL, AL)': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.EX],
            [3, Tokenizer.Type.SP],
            [4, Tokenizer.Type.AL],
            [5, Tokenizer.Type.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [2, Tokenizer.Type.EX, LineBreak.Type.PROHIBITED],
            [3, Tokenizer.Type.SP, LineBreak.Type.DIRECT],
            [4, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [5, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    },
    'handles em dashes (AL, B2, AL, AL)': {
        topic: createInput([
            [1, Tokenizer.Type.AL],
            [2, Tokenizer.Type.B2],
            [3, Tokenizer.Type.AL],
            [4, Tokenizer.Type.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, Tokenizer.Type.AL, LineBreak.Type.DIRECT],
            [2, Tokenizer.Type.B2, LineBreak.Type.DIRECT],
            [3, Tokenizer.Type.AL, LineBreak.Type.PROHIBITED],
            [4, Tokenizer.Type.AL, LineBreak.Type.EXPLICIT]
        ])
    }
}).export(module);
