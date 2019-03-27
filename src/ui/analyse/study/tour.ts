import loadShepherd from '../../../utils/shepherd'

import StudyCtrl from './StudyCtrl'

export default function startTour(ctrl: StudyCtrl) {
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
    })

    tour.addStep('members', {
      title: 'Study members',
      text: `<i data-icon='v'></i> Spectators can view the study and talk in the chat.<br>` +
        `<br><i class='fa fa-user'></i> Contributors can make moves and update the study.` +
        `<br><br>Studies are for now read-only in the application, so you must go to lichess.org to contribute to them. More features will come later in lichess app.`,
      when: {
        'before-show': () => {
          ctrl.sideMenu.open()
        }
      }
    })

    tour.addStep('chapters', {
      title: 'Study chapters',
      text: 'A study can contain several chapters.<br>' +
        'Each chapter has a distinct initial position and move tree.',
      when: {
        'before-show': () => {
          ctrl.sideMenu.open()
        }
      },
      buttons: [{
        text: 'Done',
        action: tour.next
      }]
    })

    tour.start()
  })
}
