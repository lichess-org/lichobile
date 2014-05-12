'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var pp = require('../lib/preprocess'),
    fs = require('fs');

exports['preprocess'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'preprocess html': function(test) {
    test.expect(8);

    // tests here

    var input,expected,settings;

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV!='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' -->\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match (bang)');

    input = "a\n" +
      "<!-- @if NODE_ENV=='production' !>\n" +
      "b\n" +
      "<!-- @endif -->\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match (bang)');

    test.done();
  },
  'preprocess multiple html directives inline': function(test) {
    test.expect(2);

    var input,expected,settings;

    input = "a<!-- @echo FOO -->b<!-- @echo BAR -->c";
    expected = "a1b2c";
    test.equal(pp.preprocess(input, { FOO: 1, BAR : 2}), expected, 'Should process without overreaching');

    input = "a/* @echo FOO */b/* @echo BAR */c";
    expected = "a1b2c";
    test.equal(pp.preprocess(input, { FOO: 1, BAR : 2}, 'js'), expected, 'Should process without overreaching (js)');

    test.done();
  },
  'preprocess javascript': function(test) {
    test.expect(5);

    // tests here

    var input,expected,settings;

    input = "a\n" +
      "// @if NODE_ENV!='production'\n" +
      "b\n" +
      "// @endif  \n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'js'), expected, 'Should exclude if match');


    input = "a\n" +
      "// @if NODE_ENV!='production' \n" +
      "b\n" +
      "// @endif \n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not exclude if not match');

    input = "a\n" +
      "// @if NODE_ENV=='production'\n" +
      "b\n" +
      "// @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'js'), expected, 'Should include if match');


    input = "a\n" +
      "// @if NODE_ENV=='production'\n" +
      "b\n" +
      "// @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not include if not match');

    input = "a/* @if NODE_ENV=='production' */b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'js'), expected, 'Should not include if not match');

    test.done();
  },
  'preprocess coffeescript': function(test) {
    test.expect(4);

    var input, expected, settings;

    input = "a\n" +
      "# @if NODE_ENV!='production'\n" +
      "b\n" +
      "# @endif  \n"+
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, {NODE_ENV: 'production'}, 'coffee'), expected, 'Should exclude if match');

    input = "a\n" +
      "# @if NODE_ENV!='production'\n" +
      "b\n" +
      "# @endif  \n"+
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'coffee'), expected, 'Should not exclude if not match');

    input = "a\n" +
      "# @if NODE_ENV=='production'\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nb\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}, 'coffee'), expected, 'Should include if match');


    input = "a\n" +
      "# @if NODE_ENV=='production'\n" +
      "b\n" +
      "# @endif\n" +
      "c";
    expected = "a\nc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}, 'coffee'), expected, 'Should not include if not match');

    test.done();
  },
  'preprocess html same line': function(test) {
    test.expect(8);

    // tests here

    var input,expected,settings;

    input = "a<!-- @if NODE_ENV!='production' -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match');

    input = "a<!-- @if NODE_ENV!='production' -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match');

    input = "a<!-- @if NODE_ENV!='production' !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude if match (bang)');

    input = "a<!-- @if NODE_ENV!='production' !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not exclude if not match (bang)');

    input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match');

    input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match');

    input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should include if match (bang)');

    input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Should not include if not match (bang)');

    test.done();
  },
  'preprocess sequential @ifs': function(test) {
    test.expect(2);

    var input,expected,settings;

    input = "a<!-- @if NODE_ENV=='production' -->b<!-- @endif -->c" +
            "d<!-- @if NODE_ENV=='production' -->e<!-- @endif -->f";
    expected = "abcdef";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should process 2 sequential @ifs');

    input = "a<!-- @if NODE_ENV=='production' !>b<!-- @endif -->c" +
            "d<!-- @if NODE_ENV=='production' !>e<!-- @endif -->f";
    expected = "abcdef";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should process 2 sequential @ifs (bang)');

    test.done();
  },
  'simple preprocess same line': function(test) {
    test.expect(1);

    // tests here

    var input,expected,settings;

    input = "a<!-- @exclude -->b<!-- @endexclude -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'production'}), expected, 'Should exclude generic');

    test.done();
  },
  'force at least double equals': function(test) {
    test.expect(2);

    var input,expected,settings;

    input = "a<!-- @if NODE_ENV='production' -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Fail case, should not be included');

    input = "a<!-- @if NODE_ENV='production' !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Fail case, should not be included (bang)');

    test.done();
  },
  'ifdef': function(test) {
    test.expect(6);

    var input,expected,settings;

    input = "a<!-- @ifdef NONEXISTANT -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included');

    input = "a<!-- @ifdef NODE_ENV -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included');

    input = "a<!-- @ifdef NONEXISTANT !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included (bang)');

    input = "a<!-- @ifdef NODE_ENV !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included (bang)');

    input = "a/* @ifdef NONEXISTANT */b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { },'js'), expected, 'Fail case, should not be included');

    input = "a/* @ifdef NODE_ENV */b/* @endif */c";
    expected = "abc";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'},'js'), expected, 'Success case, should be included');

    test.done();
  },
  'ifndef': function(test) {
    test.expect(6);

    var input,expected,settings;

    input = "a<!-- @ifndef NONEXISTANT -->b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included');

    input = "a<!-- @ifndef NODE_ENV -->b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included');

    input = "a<!-- @ifndef NONEXISTANT !>b<!-- @endif -->c";
    expected = "abc";
    test.equal(pp.preprocess(input, { }), expected, 'Fail case, should not be included (bang)');

    input = "a<!-- @ifndef NODE_ENV !>b<!-- @endif -->c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'}), expected, 'Success case, should be included (bang)');

    input = "a/* @ifndef NONEXISTANT */b/* @endif */c";
    expected = "abc";
    test.equal(pp.preprocess(input, { },'js'), expected, 'Fail case, should not be included');

    input = "a/* @ifndef NODE_ENV */b/* @endif */c";
    expected = "ac";
    test.equal(pp.preprocess(input, { NODE_ENV: 'dev'},'js'), expected, 'Success case, should be included');

    test.done();
  },
  'include files': function(test) {
    test.expect(3);

    var input,expected,settings;
    input = "a<!-- @include include.txt -->c";
    expected = "a!foobar!!bazqux!c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include files');

    input = "a<!-- @include includenewline.txt -->c";
    expected = "a!foobar!\n c";
    test.equal(pp.preprocess(input, { srcDir : 'test'}), expected, 'Should include files and indent if ending with a newline');

    input = "a/* @include static.txt */c";
    expected = "a!bazqux!c";
    test.equal(pp.preprocess(input, { srcDir : 'test'},'js'), expected, 'Should include files (js)');

    test.done();
  },
  'echo': function(test) {
    test.expect(2);

    var input,expected,settings;

    input = "a<!-- @echo FINGERPRINT -->c";
    expected = "a0xDEADBEEFc";
    test.equal(pp.preprocess(input, { FINGERPRINT: '0xDEADBEEF'}), expected, 'Should include echo statement');

    input = "a<!-- @echo 'FOO' -->c";
    expected = "aFOOc";
    test.equal(pp.preprocess(input), expected, 'Should echo strings');

    test.done();
  },
  'default to env': function(test) {
    test.expect(1);

    var input,expected,settings;

    input = "a<!-- @echo FINGERPRINT -->c";
    expected = "a0xDEADBEEFc";
    process.env.FINGERPRINT = '0xDEADBEEF';

    test.equal(pp.preprocess(input), expected, 'Should include echo statement');

    test.done();
  },
  'processFile': function(test) {
    test.expect(1);

    var input,expected,settings;

    expected = "a0xDEADBEEFb";
    pp.preprocessFile('test/fixtures/processFileTest.html', 'test/tmp/processFileTest.dest.html', { TEST : '0xDEADBEEF'}, function(){
      test.equal(fs.readFileSync('test/tmp/processFileTest.dest.html').toString(), expected, 'Should process a file to disk');

      test.done();
    })
  },
  'processFileSync': function(test) {
    test.expect(1);

    var input,expected,settings;

    expected = "aa0xDEADBEEFbb";
    pp.preprocessFileSync('test/fixtures/processFileSyncTest.html', 'test/tmp/processFileSyncTest.dest.html', { TEST : '0xDEADBEEF'});
    var actual = fs.readFileSync('test/tmp/processFileSyncTest.dest.html').toString()
    test.equal(actual, expected, 'Should process a file to disk');
    test.done();
  }
};
