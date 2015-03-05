var utils = require('../utils');
var widgets = require('./_commonWidgets');
var layout = require('./layout');
var menu = require('./menu');
var formWidgets = require('./_formWidgets');
var settings = require('../settings');
var i18n = require('../i18n');

function renderBody() {
  return [
    m('ul#settings', [
      m('li', formWidgets.renderCheckbox(i18n('pieceAnimation'), 'animations',
        settings.general.animations)),
      m('li', formWidgets.renderCheckbox(i18n('pieceDestinations'), 'pieceDestinations',
        settings.general.pieceDestinations)),
      m('li', formWidgets.renderCheckbox(i18n('toggleSound'), 'sound', settings.general.sound))
    ]),
    window.lichess.version ? m('section.app_version', 'v' + window.lichess.version) : null
  ];
}

module.exports = {
  controller: function() {},

  view: function() {
    var header = utils.partialƒ(widgets.header, null,
      widgets.backButton(i18n('settings'))
    );
    return layout.free(header, renderBody, widgets.empty, menu.view, widgets.empty);
  }
};
