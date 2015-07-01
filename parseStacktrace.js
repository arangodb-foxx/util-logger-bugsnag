/*global module */
'use strict';

module.exports = function parseStacktrace(stack) {
  var namedLine = /^\s*at\s([^(]+)\s\(([^)]+)\:(\d+)\:(\d+)\)\s*$/;
  var namedLine2 = /^\s*at\s([^(]+)\s\(([^)]+)\:(\d+)\)\s*$/;
  var anonymousLine = /^\s*at\s(.+)\:(\d+)\:(\d+)\s*$/;
  var anonymousLine2 = /^\s*at\s(.+)\:(\d+)\s*$/;
  return stack.split('\n').map(function (line) {
    var match = line.match(namedLine);
    if (!match) match = line.match(namedLine2);
    if (match) {
      return {
        method: match[1],
        file: match[2],
        lineNumber: Number(match[3]),
        columnNumber: match[4] === undefined ? undefined: Number(match[4])
      };
    }
    match = line.match(anonymousLine);
    if (!match) match = line.match(anonymousLine2);
    if (match) {
      return {
        method: 'anonymous function',
        file: match[1],
        lineNumber: Number(match[2]),
        columnNumber: match[3] === undefined ? undefined: Number(match[3])
      };
    }
  }).filter(Boolean);
};
