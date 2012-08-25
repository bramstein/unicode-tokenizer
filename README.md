## Unicode Tokenizer

This is a tokenizer that tokenizes text into the line breaking classes defined by the [Unicode Line Breaking algorithm (tr14)](http://unicode.org/reports/tr14/). This is useful when performing Natural Language Processing or doing manual line breaking.

Usage:

    var t = require('unicode-tokenizer'),
        tokenizer = t.createTokenizerStream();

    tokenizer.on('token', function(token, type, action) {
        console.log(token, type, action);
    });

    tokenizer.write('Hello World!');
    tokenizer.end();

The `Tokenizer` returned by `createTokenizerStream` is a valid Node.js `Stream` so it can be used with other streams:

    process.stdin.pipe(tokenizer);
    tokenizer.pipe(process.stdout);
    process.stdin.resume();

Note that in order to receive the token type and break action, you'll need to listen to the `token` event instead of the `data` event, which will only give you the token.

## Unicode support

The full range of Unicode code points are supported by this tokenizer, however the default installation only tokenizes selected portions of the [Basic Multilingual Plane](http://en.wikipedia.org/wiki/Basic_Multilingual_Plane#Basic_Multilingual_Plane) roughly corresponding to most western scripts and math symbols. To generate a tokenizer that can tokenize the whole Unicode range or a subset modify the `included-ranges.txt` and `excluded-classes.txt` and run the Makefile.
