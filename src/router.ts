import * as Rlite from 'rlite-router'
import * as RenderService from 'mithril/render'
import * as Vnode from 'mithril/render/vnode'
import signals from './signals'
import * as isFunction from 'lodash/isFunction'
import session from './session'
import { serializeQueryParameters } from './utils'
import redraw from './utils/redraw'

interface Backbutton {
  (): void
  stack: Array<(fromBB?: string) => void>
}

const uid = (function() {
  let id = 0
  return () => id++
})()

const router = new Rlite()

// unique incremented state id to determine slide direction
let currentStateId: number = 0
let viewSlideDirection = 'fwd'

export function defineRoutes(mountPoint: HTMLElement, routes: {[index: string]: Mithril.Component<any, any>}) {
  for (let route in routes) {
    const component = routes[route]
    router.add(route, function onRouteMatch({ params }) {

      const RouteComponent = {view() {
        return Vnode(component, undefined, params)
      }}

      function redraw() {
        RenderService.render(mountPoint, Vnode(RouteComponent))
      }

      signals.redraw.removeAll()
      signals.redraw.add(redraw)
      // some error may be thrown during component initialization
      // in that case shutdown redraws to avoid multiple execution of oninit
      // hook of buggy component
      try {
        redraw()
      } catch (e) {
        signals.redraw.removeAll()
        throw e
      }
    })
  }
  window.addEventListener('popstate', processQuerystring)
  processQuerystring()
}

function processQuerystring(e?: PopStateEvent) {
  if (e && e.state) {
    if (e.state.id < currentStateId) {
      viewSlideDirection = 'bwd'
    } else {
      viewSlideDirection = 'fwd'
    }
    currentStateId = e.state.id
  }
  const qs = window.location.search || '?='
  const matched = router.run(qs.slice(2))
  if (!matched) router.run('/')
}

function assignState(state?: { [k: string]: any }, path?: string) {
  // try catch to avoid ios 9 100th pushState call DOM error
  // see https://forums.developer.apple.com/thread/36650
  // and https://bugs.webkit.org/show_bug.cgi?id=156115
  // (may be only 100 calls per 30s interval in ios 10... need to test)
  try {
    const newState = state ?
      Object.assign({}, window.history.state, state) :
      window.history.state

    if (path !== undefined) {
      window.history.replaceState(newState, '', '?=' + path)
    } else {
      window.history.replaceState(newState, '')
    }
  } catch (e) { console.error(e) }
}

function replacePath(path: string) {
  assignState(undefined, path)
}

function setQueryParams(params: StringMap) {
  const path = get().replace(/\?.+$/, '')
  replacePath(path + `?${serializeQueryParameters(params)}`)
}

const backbutton = (() => {
  interface X {
    (): void
    stack?: Array<(fromBB?: string) => void>
  }

  const x: X = () => {
    const b = x.stack!.pop()
    if (isFunction(b)) {
      b('backbutton')
      redraw()
    } else if (!/^\/$/.test(get())) {
      // if playing a game as anon ask for confirmation because there is no way
      // back!
      if (/^\/game\/[a-zA-Z0-9]{12}/.test(get()) && !session.isConnected()) {
        navigator.notification.confirm(
          'Do you really want to leave the game? You can\'t go back to it after.',
          i => { if (i === 1) backHistory() }
        )
      } else {
        backHistory()
      }
    } else {
      window.navigator.app.exitApp()
    }
  }

  x.stack = []

  return <Backbutton>x

})()

function doSet(path: string, replace = false) {
  // reset backbutton stack when changing route
  backbutton.stack = []
  if (replace) {
    replacePath(path)
  } else {
    const stateId = uid()
    currentStateId = stateId
    viewSlideDirection = 'fwd'
    try {
      window.history.pushState({ id: stateId }, '', '?=' + path)
    } catch (e) { console.error(e) }
  }
  const matched = router.run(path)
  if (!matched) router.run('/')
}

// sync call to router.set must be avoided in any `oninit` mithril component
// otherwise it makes mithril create another root component on top of the
// existing one
// making router.set async makes it safe everywhere
function set(path: string, replace = false): void {
  setTimeout(() => doSet(path, replace), 0)
}

function get(): string {
  const path = window.location.search || '?=/'
  return decodeURIComponent(path.substring(2))
}

function backHistory(): void {
  if (window.navigator.app && window.navigator.app.backHistory) {
    window.navigator.app.backHistory()
  } else {
    window.history.go(-1)
  }
}

export default {
  get,
  set,
  reload(): void {
    set(get(), true)
  },
  replacePath,
  setQueryParams,
  assignState,
  backHistory,
  getViewSlideDirection(): string {
    return viewSlideDirection
  },
  backbutton
}
