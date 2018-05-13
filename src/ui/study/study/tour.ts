import loadShepherd from '../../../utils/shepherd'

export default function startTour() {
  loadShepherd()
  .then(theme => {
    const tour = new window.Shepherd.Tour({
      defaults: {
        classes: 'shepherd-element ' + theme,
        showCancelLink: true,
      }
    })

    tour.addStep('welcome', {
      title: 'Welcome to lichess study!',
      text: 'This is a shared analysis board.<br><br>' +
        'Use it to analyse games,<br>' +
        'discuss positions with friends,<br>' +
        'and of course for chess lessons!',
      attachTo: '.analyse-table'
    })

    tour.addStep('chapters', {
      title: 'Study chapters',
      text: 'A study can contain several chapters.<br>' +
        'Each chapter has a distinct initial position and move tree.',
      attachTo: '.action_bar_button.fa.fa-bars',
    })

    tour.start()
  })
}
