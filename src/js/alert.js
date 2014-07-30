'use strict';

var Zepto = require('./vendor/zepto');
var Handlebars = require('handlebars');


var source = '<div class="alert alert-{{ type }} alert-dismissible" role="alert">' +
             '<button type="button" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
             '{{{ msg }}}' +
             '</div>';
var template = Handlebars.compile(source);

function hideAll() {
  Zepto('.alert').remove();
}

function show(type, msg) {

  hideAll();

  var alert = Zepto(template({type: type, msg: msg}));
  Zepto('#mainPage').append(alert);

  Zepto(alert).tap(function() {
    Zepto(this).remove();
  });
}

module.exports = { show: show, hideAll: hideAll };
