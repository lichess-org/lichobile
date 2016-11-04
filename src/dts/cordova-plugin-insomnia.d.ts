interface Insomnia {
  keepAwake: () => void;
  allowSleepAgain: () => void;
}

interface Plugins {
  insomnia: Insomnia;
}

