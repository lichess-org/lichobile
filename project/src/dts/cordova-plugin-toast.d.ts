interface Toast {
  show: (msg: string, duration: any, position: string) => void;
  showShortTop: (msg: string) => void;
  showShortCenter: (msg: string) => void;
  showShortBottom: (msg: string) => void;
  showLongTop: (msg: string) => void;
  showLongCenter: (msg: string) => void;
  showLongBottom: (msg: string) => void;
}

interface Plugins {
  toast: Toast
}
