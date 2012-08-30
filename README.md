## Unicode Tokenizer

This is a tokenizer that tokenizes text according to the line breaking classes defined by the [Unicode Line Breaking algorithm (tr14)](http://unicode.org/reports/tr14/). It also annotates each token with its line breaking action. This is useful when performing Natural Language Processing or doing manual line breaking.

Usage:

    var ut = require('unicode-tokenizer'),
        tokenizer = ut.createTokenizerStream();

    tokenizer.on('token', function(token, type, action) {
        ...
    });

    tokenizer.write('Hello World!');
    tokenizer.end();

Note that in order to receive the token type and break action, you'll need to listen to the `token` event. The `token` parameter is a string containing the token, the `type` is a number representing the token type, and the action is also a number representing the line break action. Both the token types and line breaking actions are available as enumerations on the object returned by `require('unicode-tokenizer')`.  If, for example, you would like to do something special for tokens with class `AL` that are also an explicit break you can implement the above callback as shown below:

    tokenizer.on('token', function(token, type, action) {
        if (type === ut.Token.AL && action = ut.Break.EXPLICIT) {
            // Do something special
        }
    });

The `Tokenizer` returned by `createTokenizerStream` is also a valid Node.js `Stream` so it can be used with other streams:

    process.stdin.pipe(tokenizer);
    tokenizer.pipe(process.stdout);
    process.stdin.resume();

## Unicode support

The full range of Unicode code points are supported by this tokenizer. However the default installation only tokenizes selected portions of the [Basic Multilingual Plane](http://en.wikipedia.org/wiki/Basic_Multilingual_Plane#Basic_Multilingual_Plane) roughly corresponding to most western scripts and math symbols. To generate a tokenizer that can tokenize the whole Unicode range or a subset modify the `included-ranges.txt` and `excluded-classes.txt` and run the Makefile.
