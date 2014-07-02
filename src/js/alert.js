'use strict';

var $ = require('./vendor/zepto');
var Handlebars = require('handlebars');


var source = '<div class="alert alert-{{ type }} alert-dismissible" role="alert">' +
             '<button type="button" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
             '{{{ msg }}}' +
             '</div>';
var template = Handlebars.compile(source);

function hideAll() {
  $('.alert').remove();
}

function show(type, msg) {

  hideAll();

  var alert = $(template({type: type, msg: msg}));
  $('#mainPage').append(alert);

  $(alert).tap(function() {
    $(this).remove();
  });
}

module.exports = { show: show, hideAll: hideAll };
