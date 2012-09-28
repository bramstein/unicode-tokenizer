var vows = require('vows'),
    assert = require('assert'),
    Stream = require('stream').Stream,
    TokenType = require('../lib/TokenType'),
    BreakType = require('../lib/BreakType'),
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
        topic: createInput([[1, TokenType.SP]]),
        'correct number of tokens': function(result) {
            assert.lengthOf(result, 1);
        },
        'correct token, tokenClass and break action': function(result) {
            assert.equal(result[0][0], 1);
            assert.equal(result[0][1], TokenType.SP);
            assert.equal(result[0][2], BreakType.EXPLICIT);
        }
    },
    'handles two tokens': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.AL]
        ]),
        'correct number of tokens': function(result) {
            assert.lengthOf(result, 2);
        },
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.PROHIBITED],
            [2, TokenType.AL, BreakType.EXPLICIT]
        ])
    },
    'handles direct breaks (AL, B2, AL)': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.B2],
            [3, TokenType.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.DIRECT],
            [2, TokenType.B2, BreakType.DIRECT],
            [3, TokenType.AL, BreakType.EXPLICIT]
        ])
    },
    'handles explicit breaks (AL, NL, AL, AL)': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.NL],
            [3, TokenType.AL],
            [4, TokenType.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.PROHIBITED],
            [2, TokenType.NL, BreakType.EXPLICIT],
            [3, TokenType.AL, BreakType.PROHIBITED],
            [4, TokenType.AL, BreakType.EXPLICIT]
        ])
    },
    'handles prohibited breaks (AL, AL, AL)': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.AL],
            [3, TokenType.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.PROHIBITED],
            [2, TokenType.AL, BreakType.PROHIBITED],
            [3, TokenType.AL, BreakType.EXPLICIT]
        ])
    },
    'handles soft hyphens (AL, BA, AL, AL)': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.BA],
            [3, TokenType.AL],
            [4, TokenType.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.PROHIBITED],
            [2, TokenType.BA, BreakType.DIRECT],
            [3, TokenType.AL, BreakType.PROHIBITED],
            [4, TokenType.AL, BreakType.EXPLICIT]
        ])
    },
    'handles question marks (AL, EX, SP, AL, AL)': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.EX],
            [3, TokenType.SP],
            [4, TokenType.AL],
            [5, TokenType.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.PROHIBITED],
            [2, TokenType.EX, BreakType.PROHIBITED],
            [3, TokenType.SP, BreakType.DIRECT],
            [4, TokenType.AL, BreakType.PROHIBITED],
            [5, TokenType.AL, BreakType.EXPLICIT]
        ])
    },
    'handles em dashes (AL, B2, AL, AL)': {
        topic: createInput([
            [1, TokenType.AL],
            [2, TokenType.B2],
            [3, TokenType.AL],
            [4, TokenType.AL]
        ]),
        'correct token, tokenClass and break action': breakAs([
            [1, TokenType.AL, BreakType.DIRECT],
            [2, TokenType.B2, BreakType.DIRECT],
            [3, TokenType.AL, BreakType.PROHIBITED],
            [4, TokenType.AL, BreakType.EXPLICIT]
        ])
    }
}).export(module);
