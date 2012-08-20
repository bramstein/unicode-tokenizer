var fs = require('fs');

module.exports = function (filename, callback) {
    fs.readFile(filename, function(err, data) {
        var lines = [];

        if (err) {
            callback(err);
        } else {
            lines = data.toString().split('\n');
            lines = lines.filter(function(line) {
                return line.charAt(0) !== '#' && line.trim().length !== 0;
            });
            lines = lines.map(function(line) {
                var commentSeparator = line.indexOf('#'),
                    valueSeparator = null,
                    rangeSeparator = null,
                    value = null,
                    type = null,
                    comment = null,
                    result = {};

                if (commentSeparator !== -1) {
                    comment = line.substr(commentSeparator + 1).trim();
                    value = line.substr(0, commentSeparator).trim();
                } else {
                    value = line.trim();
                }

                valueSeparator = value.indexOf(';');

                if (valueSeparator !== -1) {
                    type = value.substr(valueSeparator + 1);
                    value = value.substr(0, valueSeparator);
                }

                rangeSeparator = value.indexOf('..');

                if (rangeSeparator !==  -1) {
                    value = [value.substr(0, rangeSeparator), value.substr(rangeSeparator + 2)];
                }

                return {
                    value: value,
                    type: type,
                    comment: comment
                };
            });
            callback(null, lines);
        }
    });
}
