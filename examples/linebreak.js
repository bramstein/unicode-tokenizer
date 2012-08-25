// Usage: node linebreak.js [word] ...
var t = require('unicode-tokenizer'),
    util = require('util'),
    tokenizer = t.createTokenizerStream();

tokenizer.on('token', function(token, type, action) {
    process.stderr.write(util.format('token: "%s", type: %d, action: %d\n', token, type, action));
});

if (process.argv.length > 2) {
    var str = process.argv.filter(function(value, i) {
            return i > 1;
        }).join(' ');
    tokenizer.write(str);
    tokenizer.end();
} else {
    process.stdin.pipe(tokenizer);
    process.stdin.resume();
}
