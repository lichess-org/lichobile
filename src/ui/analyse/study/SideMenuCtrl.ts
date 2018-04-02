import * as Zanimo from 'zanimo'
import redraw from '../../../utils/redraw'
import router from '../../../router'

export default class SideMenuCtrl {
  public isOpen: boolean = false

  public open = () => {
    this.isOpen = true
    router.backbutton.stack.push(this.close)
    const el = document.getElementById('studyMenu')
    const bd = document.getElementById('study-menu-close-overlay')
    return Promise.all([
      Zanimo(bd, 'visibility', 'visible', 0),
      Zanimo(bd, 'opacity', 0.5, 250, 'linear'),
      Zanimo(el, 'visibility', 'visible', 0),
      Zanimo(
        el,
        'transform',
        'translate3d(0,0,0)', 250, 'ease-out'
      )
    ])
    .then(redraw)
    .catch(console.log.bind(console))
  }

  public close = (fromBB?: string) => {
    if (fromBB !== 'backbutton' && this.isOpen) router.backbutton.stack.pop()
    this.isOpen = false
    const el = document.getElementById('studyMenu')
    const bd = document.getElementById('study-menu-close-overlay')
    return Promise.all([
      Zanimo(bd, 'opacity', 0, 250, 'linear'),
      Zanimo(
        el,
        'transform',
        'translate3d(100%,0,0)', 250, 'ease-out'
      )
    ])
    .then(() =>
      Promise.all([
        Zanimo(el, 'visibility', 'hidden', 0),
        Zanimo(bd, 'visibility', 'hidden', 0)
      ])
    )
    .catch(console.log.bind(console))
  }

  public toggle = () => {
    if (this.isOpen) this.close()
    else this.open()
  }
}

