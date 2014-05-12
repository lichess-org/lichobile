/*
 * preprocess
 * https://github.com/onehealth/preprocess
 *
 * Copyright (c) 2012 OneHealth Solutions, Inc.
 * Written by Jarrod Overson - http://jarrodoverson.com/
 * Licensed under the Apache 2.0 license.
 */

/*jshint node:true*/

'use strict';

exports.preprocess         = preprocess;
exports.preprocessFile     = preprocessFile;
exports.preprocessFileSync = preprocessFileSync;

var path  = require('path'),
    fs    = require('fs'),
    delim = require('./regexrules');

function preprocessFile(src, dest, context, callback) {
  context.src = src;
  context.srcDir = path.dirname(src);

  fs.readFile(src,function(err,data){
    if (err) return callback(err,data);
    var parsed = preprocess(data, context, getExtension(src));
    fs.writeFile(dest,parsed,callback);
  });
}

function preprocessFileSync(src, dest, context) {
  context.src = src;
  context.srcDir = path.dirname(src);

  var data = fs.readFileSync(src);
  var parsed = preprocess(data, context, getExtension(src));
  return fs.writeFileSync(dest,parsed);
}


function getExtension(filename) {
  var ext = path.extname(filename||'').split('.');
  return ext[ext.length - 1];
}

function preprocess(src,context,type) {
  src = src.toString();
  context = context || process.env;

  if (typeof delim[type] === 'undefined'){
    type = 'html';
  }

  var rv = src;

  rv = rv.replace(getRegex(type,'include'),function(match,line,file,include){
    file = (file || '').trim();
    var indent = line.replace(/\S/g, ' ');
    var includedContext = JSON.parse(JSON.stringify(context));
    includedContext.src = path.join(context.srcDir,file);
    includedContext.srcDir = path.dirname(includedContext.src);
    if (!fs.existsSync(includedContext.src)) {
      return includedContext.src + ' not found';
    }
    var includedSource = fs.readFileSync(includedContext.src);
    includedSource = preprocess(includedSource, includedContext, type);
    includedSource = includedSource.replace(/\n/g, '\n' + indent);
    if(includedSource) {
        return line + includedSource;
    } else {
        return "";
    }
  });

  rv = rv.replace(getRegex(type,'exclude'),function(match,test,include){
    return testPasses(test,context) ? '' : include;
  });

  rv = rv.replace(getRegex(type,'ifdef'),function(match,test,include){
    test = (test || '').trim();
    return typeof context[test] !== 'undefined' ? include : '';
  });

  rv = rv.replace(getRegex(type,'ifndef'),function(match,test,include){
    test = (test || '').trim();
    return typeof context[test] === 'undefined' ? include : '';
  });

  rv = rv.replace(getRegex(type,'if'),function(match,test,include){
    return testPasses(test,context) ? include : '';
  });

  rv = rv.replace(getRegex(type,'echo'),function(match,variable) {
    variable = (variable || '').trim();
    // if we are surrounded by quotes, echo as a string
    var stringMatch = variable.match(/^(['"])(.*)\1$/);
    if (stringMatch) return stringMatch[2];

    return context[(variable || '').trim()];
  });

  return rv;
}

function getRegex(type, def) {

  var isRegex = typeof delim[type][def] === 'string' || delim[type][def] instanceof RegExp;
  return isRegex ?
            new RegExp(delim[type][def],'gi') :
            new RegExp(delim[type][def].start + '((?:.|\n|\r)*?)' + delim[type][def].end,'gi');
}

// @todo: fix this lodash template hackiness. Got this working quickly but is dumb now.
function getTestTemplate(test) {
  /*jshint evil:true*/
  test = test || 'true==true';

  // force single equals replacement
  test = test.replace(/([^=])=([^=])/g, '$1==$2');

  return new Function("context", "with (context||{}){ return ( " + test + " ) }");
}

function testPasses(test,context) {
  var testFn = getTestTemplate(test);
  return testFn(context);
}
