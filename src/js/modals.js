'use strict';

// duplication of ratchet code to hook events on modal open

var findModals = function (target) {
  var i;
  var modals = document.querySelectorAll('a');

  for (; target && target !== document; target = target.parentNode) {
    for (i = modals.length; i--;) {
      if (modals[i] === target) {
        return target;
      }
    }
  }
};

var getModal = function (event) {
  var modalToggle = findModals(event.target);
  if (modalToggle && modalToggle.hash) {
    return document.querySelector(modalToggle.hash);
  }
};


module.exports.getModal = getModal;
