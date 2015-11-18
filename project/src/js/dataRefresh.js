import socket from './socket';
import session from './session';
import { hasNetwork } from './utils';

const refreshInterval = 60000 * 2; // 2 minutes refresh polling
var refreshIntervalID;

export default function () {

  refreshIntervalID = setInterval(refresh, refreshInterval);

  document.addEventListener('resume', onResume, false);
  document.addEventListener('pause', onPause, false);

}

function refresh() {
  if (hasNetwork() && session.isConnected())
    session.refresh();
}

function onResume() {
  refresh();
  refreshIntervalID = setInterval(refresh, refreshInterval);
  socket.connect();
}

function onPause() {
  clearInterval(refreshIntervalID);
  socket.disconnect();
}
