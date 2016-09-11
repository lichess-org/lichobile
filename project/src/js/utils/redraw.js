import signals from '../signals';

let scheduledAnimationFrame = false;

export default function() {
  if (!scheduledAnimationFrame) {
    scheduledAnimationFrame = requestAnimationFrame(() => {
      scheduledAnimationFrame = false;
      signals.redraw.dispatch();
    });
  }
}
