/*jslint indent: 2, nomen: true, maxlen: 120 */
/*global require, describe, it */
(function () {
  'use strict';
  var expect = require('expect.js'),
    parseStack = require('../parseStacktrace');

  function trace(method, file, line, col, indent) {
    if (indent === undefined) indent = '  ';
    if (method) {
      return indent + 'at ' + method + ' (' + file + ':' + line + (col ? ':' + col : '') + ')';
    } else {
      return indent + 'at ' + file + ':' + line + (col ? ':' + col : '');
    }
  }

  describe('parseStacktrace', function () {
    it('ignores malformed lines', function () {
      expect(parseStack('hello\nworld\n  at chicken chicken\n  at ::')).to.eql([]);
    });
    it('parses fully-qualified stack lines', function () {
      expect(parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123, 456))).to.eql([{
        method: 'chicken.chicken.chicken',
        file: 'chicken.js',
        lineNumber: 123,
        columnNumber: 456
      }]);
    });
    it('parses fully-qualified stack lines missing column numbers', function () {
      expect(parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123))).to.eql([{
        method: 'chicken.chicken.chicken',
        file: 'chicken.js',
        lineNumber: 123,
        columnNumber: undefined
      }]);
    });
    it('parses anonymous stack lines', function () {
      expect(parseStack(trace(null, 'chicken/chicken/chicken.js', 123, 456))).to.eql([{
        method: 'anonymous function',
        file: 'chicken/chicken/chicken.js',
        lineNumber: 123,
        columnNumber: 456
      }]);
    });
    it('parses anonymous stack lines missing column numbers', function () {
      expect(parseStack(trace(null, 'chicken/chicken/chicken.js', 123))).to.eql([{
        method: 'anonymous function',
        file: 'chicken/chicken/chicken.js',
        lineNumber: 123,
        columnNumber: undefined
      }]);
    });
    it('ignores trailing whitespace', function () {
      var sample = parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123, 456, '  '));

      expect(parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123, 456, ''))).to.eql(sample);
      expect(parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123, 456, '   '))).to.eql(sample);
      expect(parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123, 456, '\t'))).to.eql(sample);
      expect(parseStack(trace('chicken.chicken.chicken', 'chicken.js', 123, 456, '\t  \t\t '))).to.eql(sample);
    });
    it('correctly handles', function () {
      var data = [
        [undefined, '/some/entry-point.js', 1, 1],
        ['[object Object].call.sayHello', '/hello/world.js', 101, undefined],
        ['foo.bar', 'qux.js', 42, 23],
        ['Object.chicken', 'chicken/chicken/chicken.js', 123, 456],
        [undefined, 'global context method', 1, 12]
      ];
      var stack = data.map(function (args) {
        return trace.apply(null, args);
      });
      stack.splice(2, 0, 'hello world');
      stack.push('chicken chicken chicken');
      stack.push('  at at at ::::');
      stack.unshift('ERROR Error: ERROR ERROR');
      expect(parseStack(stack.join('\n'))).to.eql(data.map(function (args) {
        return {
          method: args[0] || 'anonymous function',
          file: args[1],
          lineNumber: args[2],
          columnNumber: args[3]
        };
      }));
    });
  });
}());