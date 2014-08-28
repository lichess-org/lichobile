'use strict';

var Zepto = require('./vendor/zepto');
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
    Zepto(element).tap(function() {
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

ko.observableArray.fn.subscribeArrayChanged = function(addCallback, deleteCallback) {
  var previousValue;
  this.subscribe(function(_previousValue) {
    previousValue = _previousValue.slice(0);
  }, undefined, 'beforeChange');
  return this.subscribe(function(latestValue) {
    var editScript = ko.utils.compareArrays(previousValue, latestValue);
    for (var i = 0, j = editScript.length; i < j; i++) {
      switch (editScript[i].status) {
        case "retained":
          break;
        case "deleted":
          if (deleteCallback)
            deleteCallback(editScript[i].value);
          break;
        case "added":
          if (addCallback)
            addCallback(editScript[i].value);
          break;
      }
    }
    previousValue = undefined;
  });
};
