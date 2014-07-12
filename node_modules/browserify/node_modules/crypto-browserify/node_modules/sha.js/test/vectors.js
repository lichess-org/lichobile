
var vectors = require('./nist-vectors.json')
var tape = require('tape')
//var from = require('bops/typedarray/from')
var Buffer = require('buffer').Buffer
var hexpp = require('../hexpp')

var createHash = require('../')

function makeTest(alg, i, verbose) {
  var v = vectors[i]
  
  tape(alg + ': NIST vector ' + i, function (t) {
    if(verbose) {
      console.log(v)
      console.log('VECTOR', i)
      console.log('INPUT', v.input)
      console.log(hexpp(new Buffer(v.input, 'base64')))
      console.log(new Buffer(v.input, 'base64').toString('hex'))
    }
    var buf = new Buffer(v.input, 'base64')
    t.equal(createHash(alg).update(buf).digest('hex'), v[alg])
    setTimeout(function () {
      //avoid "too much recursion" errors in tape in firefox
      t.end()
    })
  })
  
}

if(process.argv[2])
  makeTest(process.argv[2], parseInt(process.argv[3]), true)
else
  vectors.forEach(function (v, i) {
    makeTest('sha1', i)
    makeTest('sha256', i)
  })



