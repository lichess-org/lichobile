var utils = require('../../utils');
var provisionalDeviation = require('../../lichess/perfs').provisionalDeviation;
var helper = require('../helper');

module.exports = function(key, name, perf) {
  return m('div.perf', {
    'data-icon': utils.gameIcon(key)
  }, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      perf.rd >= provisionalDeviation ? '?' : null,
      helper.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
};

