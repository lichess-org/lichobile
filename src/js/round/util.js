var util = {};

util.str2move = function(m) {
  return m ? [m.slice(0, 2), m.slice(2, 4)] : null;
};

util.opponentColor = function(c) {
  return c === 'white' ? 'black' : 'white';
};

module.exports = util;
