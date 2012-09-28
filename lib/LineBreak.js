var EventEmitter = require('events').EventEmitter,
    TokenType = require('./TokenType'),
    BreakType = require('./BreakType'),
    util = require('util');

function LineBreak() {
    EventEmitter.call(this);
    this.tokenClass = null;
    this.previousToken = null;
    this.previousTokenClass = null;
}

util.inherits(LineBreak, EventEmitter);

var DI = BreakType.DIRECT,
    IN = BreakType.INDIRECT,
    CI = BreakType.COMBINING_INDIRECT,
    CP = BreakType.COMBINING_PROHIBITED,
    PR = BreakType.PROHIBITED,
    EX = BreakType.EXPLICIT,
    pairTable = [
        [PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, PR, CP, PR, PR, PR, PR, PR, PR],
        [DI, PR, PR, IN, IN, PR, PR, PR, PR, IN, IN, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, PR, PR, PR, PR, IN, IN, IN, IN, IN, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [PR, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, IN, DI, IN, IN, DI, DI, PR, CI, PR, IN, IN, IN, IN, IN],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, DI, IN, PR, PR, PR, DI, DI, IN, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, PR, PR, IN, DI, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, DI, DI, DI, DI, DI, IN, IN, DI, PR, PR, CI, PR, DI, DI, DI, DI, DI],
        [DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, DI, PR, DI, DI, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, DI, DI, IN, IN, IN, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, DI],
        [IN, PR, PR, IN, IN, IN, PR, PR, PR, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, IN, PR, CI, PR, IN, IN, IN, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, IN, IN, IN, IN, DI],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, IN, IN],
        [DI, PR, PR, IN, IN, IN, PR, PR, PR, DI, IN, DI, DI, DI, DI, IN, IN, IN, DI, DI, PR, CI, PR, DI, DI, DI, DI, IN]
    ];

LineBreak.prototype.end = function() {
    if (this.previousToken) {
        this.emit('action', this.previousToken, this.previousTokenClass, BreakType.EXPLICIT);
    }
    this.emit('end');
};

LineBreak.prototype.process = function(token, tokenClass) {
    var breakAction = null;

    if (this.tokenClass !== null) {
        if (this.tokenClass !== TokenType.BK && (this.tokenClass !== TokenType.CR || tokenClass === TokenType.LF)) {
            if (tokenClass === TokenType.SP) {
                breakAction = BreakType.PROHIBITED;
            } else if (tokenClass === TokenType.BK ||
                       tokenClass === TokenType.NL ||
                       tokenClass === TokenType.LF) {
                breakAction = BreakType.PROHIBITED;
                this.tokenClass = TokenType.BK;
            } else if (tokenClass === TokenType.CR) {
                breakAction = BreakType.PROHIBITED;
                this.tokenClass = TokenType.BK;
            } else {
                breakAction = pairTable[this.tokenClass][tokenClass];

                if (breakAction === BreakType.INDIRECT) {
                    if (this.previousTokenClass === TokenType.SP) {
                        breakAction = BreakType.INDIRECT;
                    } else {
                        breakAction = BreakType.PROHIBITED;
                    }
                    this.tokenClass = tokenClass;
                } else if (breakAction === BreakType.COMBINING_PROHIBITED) {
                    breakAction = BreakType.COMBINING_PROHIBITED;
                    if (this.previousTokenClass === TokenType.SP) {
                        this.tokenClass = tokenClass;
                    }
                } else if (breakAction === BreakType.COMBINING_INDIRECT) {
                    breakAction = BreakType.PROHIBITED;
                    if (this.previousTokenClass === TokenType.SP) {
                        breakAction = BreakType.COMBINING_INDIRECT;
                        this.tokenClass = tokenClass;
                    }
                } else {
                    this.tokenClass = tokenClass;
                }
            }
            this.emit('action', this.previousToken, this.previousTokenClass, breakAction);
        } else {
            this.emit('action', this.previousToken, this.previousTokenClass, BreakType.EXPLICIT);
            if (tokenClass === TokenType.SP) {
                this.tokenClass = TokenType.WJ;
            } else if (tokenClass === TokenType.LF || tokenClass === TokenType.NL) {
                this.tokenClass = TokenType.BK;
            } else {
                this.tokenClass = tokenClass;
            }
        }
    } else {
        if (tokenClass === TokenType.SP) {
            this.tokenClass = TokenType.WJ;
        } else if (tokenClass === TokenType.LF || tokenClass === TokenType.NL) {
            this.tokenClass = TokenType.BK;
        } else {
            this.tokenClass = tokenClass;
        }
    }
    this.previousToken = token;
    this.previousTokenClass = tokenClass;
};

module.exports = LineBreak;
