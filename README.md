## Unicode Tokenizer

This is a tokenizer that tokenizes text into the line breaking classes defined by the [Unicode Line Breaking algorithm (tr14)](http://unicode.org/reports/tr14/). This is useful when performing Natural Language Processing or doing manual line breaking.

Usage:

    var Tokenizer = require('Tokenizer'),
        tokenizer = new Tokenizer();

    tokenizer.on('data', function(tokenClass, token) {
        console.log(tokenClass, token);
    });

    tokenizer.write('Hello World!');
    tokenizer.end();

The `Tokenizer` class is a valid Node.js `Stream` so it can be used with other streams:

    process.stdin.pipe(tokenizer);
    tokenizer.pipe(process.stdout);

## Unicode support

The full range of Unicode code points are supported by this tokenizer, however the default installation only tokenizes selected portions of the [Basic Multilingual Plane](http://en.wikipedia.org/wiki/Basic_Multilingual_Plane#Basic_Multilingual_Plane) roughly corresponding to most western scripts and math symbols. To generate a tokenizer that can tokenize the whole Unicode range or a subset modify the `included-ranges.txt` and `excluded-classes.txt` and run the Makefile.
