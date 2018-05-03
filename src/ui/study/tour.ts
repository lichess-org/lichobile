import * as Shepherd from 'tether-shepherd'

const tour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-arrows'
  }
})

tour.addStep('welcome', {
  title: 'Welcome to lichess study!',
  text: 'This is a shared analysis board.<br><br>' +
    'Use it to analyse and annotate games,<br>' +
    'discuss positions with friends,<br>' +
    'and of course for chess lessons!<br><br>' +
    'It\'s a powerful tool, let\'s take some time to see how it works.',
  attachTo: '.analyse-table'
})

export default tour
