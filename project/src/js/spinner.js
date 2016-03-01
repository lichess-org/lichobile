var timeoutId;

export default {
  spin() {
    if (timeoutId || document.getElementById('globalSpinner')) {
      return false;
    }

    const spinner = document.createElement('div');
    spinner.className = 'spinner globalSpinner';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '20');
    circle.setAttribute('cy', '20');
    circle.setAttribute('r', '18');
    circle.setAttribute('fill', 'none');
    svg.appendChild(circle);
    spinner.appendChild(svg);

    timeoutId = setTimeout(() => document.body.appendChild(spinner), 200);
  },

  stop() {
    clearTimeout(timeoutId);
    timeoutId = null;
    const spinners = document.getElementsByClassName('globalSpinner');
    if (spinners.length) {
      setTimeout(function() {
        while (spinners[0]) document.body.removeChild(spinners[0]);
      }, 500);
    }
  },

  getVdom(classes) {
    return (
      <div class={'spinner ' + classes}>
        <svg viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none"></circle>
        </svg>
      </div>
    );
  }

};
