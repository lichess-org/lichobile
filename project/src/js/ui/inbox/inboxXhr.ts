import { fetchJSON } from '../../http';

export function inbox() {
  return fetchJSON('/inbox', {}, true);
}

export function message(id) {
  return fetchJSON('/inbox/' + id, {}, true);
}

export function answer(id, response) {
  return fetchJSON('/inbox/' + id, {
    method: 'POST',
    body: JSON.stringify({
      text: response
    })
  }, true);
}

export function newThread(username, subject, text) {
  return fetchJSON('/inbox/new', {
    method: 'POST',
    body: JSON.stringify({
      username,
      subject,
      text
    })
  }, true);
}

export function deleteThread(id) {
  return fetchJSON('/inbox/' + id + '/delete', {method: 'POST'}, true);
}
