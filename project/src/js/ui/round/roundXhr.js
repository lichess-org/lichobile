var http = require('../../http');

function reload(ctrl) {
  return http.request(ctrl.data.url.round).then(function(data) {
    return data;
  });
}

module.exports = {
  reload: reload
};
