var forIn = require('lodash-node/modern/objects/forIn')

// {a1: {role: 'rook', color: 'white'}, ...}
Pieces = function(data) {
  this.all = data;
  this.get = function(key) {
    return data[key];
  }
  this.remove = function(key) {
    delete data[key];
  }
  this.put = function(key, piece) {
    data[key] = piece;
  }
  this.move = function(orig, dest) {
    if (orig === dest || !this.get(orig)) return false;
    this.put(dest, this.get(orig));
    this.remove(orig);
    return true;
  };
  this.set = function(pieces) {
    forIn(pieces, function(piece, key) {
      if (piece) this.put(key, piece);
      else this.remove(key);
    }.bind(this));
  };
};

module.exports = {
  Pieces: Pieces
};
