import signals from '../signals';

let scheduledAnimationFrame = false;

export default function redraw() {
  if (!scheduledAnimationFrame) {
    scheduledAnimationFrame = requestAnimationFrame(() => {
      scheduledAnimationFrame = false;
      signals.redraw.dispatch();
    });
  }
}
