import { request } from '../../http';

export function reload(ctrl) {
  return request(ctrl.data.url.round).then(function(data) {
    return data;
  });
}
