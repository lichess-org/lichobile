let foreground = true;

export function isForeground() {
  return foreground;
}

export function setForeground() {
  foreground = true;
}

export function setBackground() {
  foreground = false;
}
