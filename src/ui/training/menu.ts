import h from 'mithril/hyperscript'
import session from '../../session'
import i18n from '../../i18n'
import router from '../../router'
import { hasNetwork } from '../../utils'
import redraw from '../../utils/redraw'
import { UserData as PuzzleUserData } from '../../lichess/interfaces/training'
import loginModal from '../loginModal'
import popupWidget from '../shared/popup'
import * as helper from '../helper'

import TrainingCtrl from './TrainingCtrl'

export interface IMenuCtrl {
  open: () => void
  close: () => void
  isOpen: () => boolean
  root: TrainingCtrl
  user: () => OfflineUser | null
}

interface OfflineUser {
  username: string
  data: PuzzleUserData
}

export default {

  controller(root: TrainingCtrl): IMenuCtrl {
    let isOpen = false
    let puzzleUser: OfflineUser | null = null

    function open() {
      router.backbutton.stack.push(close)
      isOpen = true

      const user = session.get()
      if (user) {
        root.database.fetch(user.id)
        .then(data => {
          if (data) {
            puzzleUser = {
              username: user.username,
              data: data.user,
            }
            redraw()
          }
        })
      }
    }

    function close(fromBB?: string) {
      if (fromBB !== 'backbutton' && isOpen) router.backbutton.stack.pop()
      isOpen = false
    }

    return {
      open,
      close,
      isOpen: () => isOpen,
      user: () => puzzleUser,
      root,
    }
  },

  view(ctrl: IMenuCtrl) {
    return popupWidget(
      'trainingMenu',
      undefined,
      () => renderTrainingMenu(ctrl),
      ctrl.isOpen(),
      ctrl.close
    )
  }
}

function renderTrainingMenu(ctrl: IMenuCtrl) {
  const puzzleUser = ctrl.user()
  if (ctrl.root.data && ctrl.root.data.user && hasNetwork()) {
    return renderUserInfosOnline(ctrl.root.data.user, ctrl)
  }
  else if (puzzleUser !== null && hasNetwork()) {
    return renderUserInfosOnline(puzzleUser.data)
  }
  else if (puzzleUser !== null) {
    return renderUserInfosOffline(puzzleUser, ctrl)
  }
  else {
    return renderSigninBox()
  }
}

function renderSigninBox() {
  return h('div.trainingMenuContent', [
    h('p', i18n('toTrackYourProgress')),
    h('p.signin',
      h('button.defaultButton', {
        oncreate: helper.ontap(loginModal.open)
      }, [h('span.fa.fa-user'), i18n('signIn')])
    ),
  ])
}

function renderUserInfosOffline(user: OfflineUser, ctrl: IMenuCtrl) {
  const rating = user.data.rating
  return h('div.training-offlineInfos', [
    h('p', ['You are currently offline. Your last recorded rating as ', h('strong', user.username), ' is ', h('strong', rating), '.']),
    h('p', 'You still have ', h('strong', ctrl.root.nbUnsolved), ' saved puzzles to solve.'),
    h('p', 'Puzzles are automatically downloaded by batches so you can solve them seamlessly while having bad network conditions or when you are offline.'),
    h('p', 'Your puzzle history and rating will be updated as soon as you are back online.'),
  ])
}

function renderUserInfosOnline(user: PuzzleUserData, ctrl?: IMenuCtrl) {
  const rating = user.rating
  var headerList = [
    h('p.trainingRatingHeader', h.trust(i18n('xRating', `<strong>${rating}</strong>`)))
  ]
  if (ctrl){
  return headerList.concat([
    h('div.select_input', [
      h('label', i18n('difficultyLevel')),
      h('select', {
        id: 'select_puzzle_difficulty',
        value: ctrl.root.data.user?.requested_difficulty || '',
        onchange(e: Event) {
          ctrl.root.setDifficulty((e.target as HTMLInputElement).value as PuzzleDifficulty)
          ctrl.close()
        },
      }, [
        h('option[value=easiest]', i18n('easiest')),
        h('option[value=easier]', i18n('easier')),
        h('option[value=normal]', i18n('normal')),
        h('option[value=harder]', i18n('harder')),
        h('option[value=hardest]', i18n('hardest'))
      ])
    ])
  ])
  }
  return headerList
}
