var utils = require('../../utils');
var helper = require('../helper');

module.exports = function(key, name, perf) {
  return m('div.perf', {
    'data-icon': utils.gameIcon(key)
  }, [
    m('span.name', name),
    m('div.rating', [
      perf.rating,
      helper.progress(perf.prog),
      m('span.nb', '/ ' + perf.games)
    ])
  ]);
};

