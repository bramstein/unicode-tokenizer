var EventEmitter = require('events').EventEmitter,
    Tokenizer = require('./Tokenizer'),
    util = require('util');

function LineBreak() {
    EventEmitter.call(this);
    this.tokenClass = null;
    this.previousToken = null;
    this.previousTokenClass = null;
}

util.inherits(LineBreak, EventEmitter);

LineBreak.Type = {
   // A line break opportunity exists between two adjacent
   // characters of the given line breaking classes.
   // Example: break before an em-dash
   DIRECT: 0,

   // A line break opportunity exists between two characters
   // of the given line breaking classes only if they are
   // separated by one or more spaces.
   // Example: two words separated by a space
   INDIRECT: 1,

   COMBINING_INDIRECT: 2,

   COMBINING_PROHIBITED: 3,

   // No line break opportunity exists between two characters
   // of the given line breaking classes, even if they are
   // separated by one or more space characters.
   // Example: non-breaking space
   PROHIBITED: 4,

   // A line must break following a character that has the
   // mandatory break property.
   EXPLICIT: 5
};

var DI = LineBreak.Type.DIRECT,
    IN = LineBreak.Type.INDIRECT,
    CI = LineBreak.Type.COMBINING_INDIRECT,
    CP = LineBreak.Type.COMBINING_PROHIBITED,
    PR = LineBreak.Type.PROHIBITED,
    EX = LineBreak.Type.EXPLICIT,
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
        this.emit('action', this.previousToken, this.previousTokenClass, LineBreak.Type.EXPLICIT);
    }
    this.emit('end');
};

LineBreak.prototype.process = function(token, tokenClass) {
    var breakAction = null;

    if (this.tokenClass !== null) {
        if (this.tokenClass !== Tokenizer.Type.BK && (this.tokenClass !== Tokenizer.Type.CR || tokenClass === Tokenizer.Type.LF)) {
            if (tokenClass === Tokenizer.Type.SP) {
                breakAction = LineBreak.Type.PROHIBITED;
            } else if (tokenClass === Tokenizer.Type.BK ||
                       tokenClass === Tokenizer.Type.NL ||
                       tokenClass === Tokenizer.Type.LF) {
                breakAction = LineBreak.Type.PROHIBITED;
                this.tokenClass = Tokenizer.Type.BK;
            } else if (tokenClass === Tokenizer.Type.CR) {
                breakAction = LineBreak.Type.PROHIBITED;
                this.tokenClass = Tokenizer.Type.BK;
            } else {
                breakAction = pairTable[this.tokenClass][tokenClass];

                if (breakAction === LineBreak.Type.INDIRECT) {
                    if (this.previousTokenClass === Tokenizer.Type.SP) {
                        breakAction = LineBreak.Type.INDIRECT;
                    } else {
                        breakAction = LineBreak.Type.PROHIBITED;
                    }
                    this.tokenClass = tokenClass;
                } else if (breakAction === LineBreak.Type.COMBINING_PROHIBITED) {
                    breakAction = LineBreak.Type.COMBINING_PROHIBITED;
                    if (this.previousTokenClass === Tokenizer.Type.SP) {
                        this.tokenClass = tokenClass;
                    }
                } else if (breakAction === LineBreak.Type.COMBINING_INDIRECT) {
                    breakAction = LineBreak.Type.PROHIBITED;
                    if (this.previousTokenClass === Tokenizer.Type.SP) {
                        breakAction = LineBreak.Type.COMBINING_INDIRECT;
                        this.tokenClass = tokenClass;
                    }
                } else {
                    this.tokenClass = tokenClass;
                }
            }
            this.emit('action', this.previousToken, this.previousTokenClass, breakAction);
        } else {
            this.emit('action', this.previousToken, this.previousTokenClass, LineBreak.Type.EXPLICIT);
            if (tokenClass === Tokenizer.Type.SP) {
                this.tokenClass = Tokenizer.Type.WJ;
            } else if (tokenClass === Tokenizer.Type.LF || tokenClass === Tokenizer.Type.NL) {
                this.tokenClass = Tokenizer.Type.BK;
            } else {
                this.tokenClass = tokenClass;
            }
        }
    } else {
        if (tokenClass === Tokenizer.Type.SP) {
            this.tokenClass = Tokenizer.Type.WJ;
        } else if (tokenClass === Tokenizer.Type.LF || tokenClass === Tokenizer.Type.NL) {
            this.tokenClass = Tokenizer.Type.BK;
        } else {
            this.tokenClass = tokenClass;
        }
    }
    this.previousToken = token;
    this.previousTokenClass = tokenClass;
};

module.exports = LineBreak;
