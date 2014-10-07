var util = {};

util.str2move = function(m) {
  return m ? [m.slice(0, 2), m.slice(2, 4)] : null;
};

module.exports = util;
