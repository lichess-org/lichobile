var compact = require('lodash-node/modern/arrays/compact');
var helper = require('./helper');
var utils = require('../utils');
var xhr = require('../xhr');
var settings = require('../settings');
var session = require('../session');
var formWidgets = require('./widget/form');
var popupWidget = require('./widget/popup');
var i18n = require('../i18n');
var backbutton = require('../backbutton');

var inviteForm = {};
inviteForm.isOpen = false;

inviteForm.open = function() {
  helper.analyticsTrackView('Invite Friend Form');
  backbutton.stack.push(inviteForm.close);
  inviteForm.isOpen = true;
};

inviteForm.close = function(fromBB) {
  if (fromBB !== 'backbutton' && inviteForm.isOpen) backbutton.stack.pop();
  inviteForm.isOpen = false;
};

function invite() {
  return xhr.inviteFriend().then(function(data) {
    console.log(data);
    m.route('/game' + data.url.round);
  }, function(error) {
    utils.handleXhrError(error);
    throw error;
  });
}

function renderForm() {
  var formName = 'invite';
  var settingsObj = settings.game.invite;
  var variants = settings.game.invite.availableVariants;
  var timeModes = settings.game.invite.availableTimeModes;
  var timeMode = settingsObj.timeMode();
  var hasClock = timeMode === '1';
  var hasDays = timeMode === '2';

  var colors = compact([
    ['randomColor', 'random'],
    ['white', 'white'],
    ['black', 'black']
  ]);

  var modes = session.isConnected() ? [
    ['casual', '0'],
    ['rated', '1']
  ] : [
    ['casual', '0']
  ];

  var generalFieldset = [
    m('div.select_input', {
      key: formName + 'color'
    }, [
      formWidgets.renderSelect('side', formName + 'color', colors, settingsObj.color),
    ]),
    m('div.select_input', {
      key: formName + 'variant'
    }, [
      formWidgets.renderSelect('variant', formName + 'variant', variants, settingsObj.variant),
    ]),
    m('div.select_input', {
      key: formName + 'mode'
    }, [
      formWidgets.renderSelect('mode', formName + 'mode', modes, settingsObj.mode)
    ])
  ];

  var timeFieldset = [
    m('div.select_input', {
      key: formName + 'timeMode'
    }, [
      formWidgets.renderSelect('clock', formName + 'timeMode', timeModes, settingsObj.timeMode)
    ])
  ];

  if (hasClock) {
    timeFieldset.push(
      m('div.select_input.inline', {
        key: formName + 'time'
      }, [
        formWidgets.renderSelect('time', formName + 'time',
          settings.game.availableTimes.map(utils.tupleOf), settingsObj.time, false)
      ]),
      m('div.select_input.inline', {
        key: formName + 'increment'
      }, [
        formWidgets.renderSelect('increment', formName + 'increment',
          settings.game.availableIncrements.map(utils.tupleOf), settingsObj.increment, false)
      ])
    );
  }

  if (hasDays) {
    timeFieldset.push(
      m('div.select_input.large_label', {
        key: formName + 'days'
      }, [
        formWidgets.renderSelect('daysPerTurn', formName + 'days',
          settings.game.availableDays.map(utils.tupleOf), settingsObj.days, false)
      ]));
  }

  return m('form#invite_form.game_form', {
    onsubmit: function(e) {
      e.preventDefault();
      if (!settings.game.isTimeValid(settingsObj)) return;
      inviteForm.close();
      invite();
    }
  }, [
    m('fieldset', generalFieldset),
    m('fieldset#clock', timeFieldset),
    m('fieldset', [
      m('button[data-icon=E][type=submit]', i18n('playWithAFriend'))
    ])
  ]);
}

inviteForm.view = function() {

  return popupWidget(
    'invite_form_popup game_form_popup',
    null,
    renderForm(),
    inviteForm.isOpen,
    inviteForm.close
  );
};

module.exports = inviteForm;
