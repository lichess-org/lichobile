'use strict';

var $ = require('./vendor/zepto');
var ko = require('knockout');
var storage = require('./storage');

ko.extenders.persist = function(target, key) {

  var initialValue = target();

  // Load existing value from storage if set
  if (key && storage.get(key) !== null) {
    try {
      initialValue = storage.get(key);
    } catch (e) {
    }
  }
  target(initialValue);

  // Subscribe to new values and add them to storage
  target.subscribe(function (newValue) {
    storage.set(key, newValue);
  });
  return target;

};

ko.bindingHandlers.tap = {
  init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    var callback = allBindingsAccessor().tap;
    $(element).tap(function() {
      callback(viewModel);
    });
  }
};

ko.bindingHandlers.toggle = {
  init: function (element, valueAccessor) {
    var value = valueAccessor();
    ko.applyBindingsToNode(element, {
      tap: function () {
        value(!value());
      }
    });
  }
};
