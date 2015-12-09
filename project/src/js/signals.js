import Signal from 'signals';

export default {
  socket: {
    connected: new Signal(),
    disconnected: new Signal()
  },
  seekCanceled: new Signal()
};
