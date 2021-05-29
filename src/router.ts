import { Dialog } from '@capacitor/dialog'
import { App } from '@capacitor/app'
import Rlite from 'rlite-router'
import render from 'mithril/render'
import Vnode from 'mithril/render/vnode'
import isFunction from 'lodash-es/isFunction'

import signals from './signals'
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
let currentStateId = 0
let viewSlideDirection = 'fwd'

let previousPath = '/'

const mountPoint = document.body

export function withRouter(f: (r: Rlite.Rlite) => void): void {
  f(router)
}

export function onRouteMatch<T>(component: Mithril.Component, params: T): void {

  const RouteComponent = {view() {
    return Vnode(component, undefined, params)
  }}

  function redraw() {
    render(mountPoint, Vnode(RouteComponent))
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
}

export function processWindowLocation(e?: PopStateEvent): void {
  if (e && e.state) {
    if (e.state.id < currentStateId) {
      viewSlideDirection = 'bwd'
    } else {
      viewSlideDirection = 'fwd'
    }
    currentStateId = e.state.id
  }
  previousPath = getPath()
  const qs = window.location.search || '?='
  const matched = router.run(qs.slice(2))
  if (!matched) router.run('/')
}

const History = {
  replaceState(state?: { [k: string]: unknown }, path?: string): void {
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
  },

  pushState(path: string): void {
    const stateId = uid()
    currentStateId = stateId
    viewSlideDirection = 'fwd'
    try {
      window.history.pushState({ id: stateId }, '', '?=' + path)
    } catch (e) { console.error(e) }
  },
}

function setQueryParams(params: Record<string, string>, newState = false): void {
  const path = (window.location.search || '?=/').substring(2).replace(/\?.+$/, '')
  const newPath = path + `?${serializeQueryParameters(params)}`
  if (newState) {
    setPath(newPath, true)
  } else {
    History.replaceState(undefined, newPath)
  }
}

function deleteQueryParam(name: string, newState = false): void {
  const params = getQueryParams()
  if (params) {
    delete params[name]
    setQueryParams(params, newState)
  }
}

function getQueryParams(): Record<string, string> {
  const path = getPath()
  const match = path.match(/\?.+$/)
  const params: Record<string, string> = {}
  if (match && match[0]) {
    for (const [k, v] of new URLSearchParams(match[0])) {
      params[k] = v
    }
  }
  return params
}

const backbutton: Backbutton = (() => {
  type BBHandler = (fromBB?: string) => void

  interface X {
    (): void
    stack?: Array<BBHandler>
  }

  const x: X = () => {
    const b = x.stack!.pop()
    if (isFunction(b)) {
      b('backbutton')
      redraw()
    } else if (!/^\/$/.test(getPath())) {
      // if playing a game as anon ask for confirmation because there is no way
      // back!
      if (/^\/game\/[a-zA-Z0-9]{12}/.test(getPath()) && !session.isConnected()) {
        Dialog.confirm({
          title: 'Confirmation',
          message: 'Do you really want to leave the game? You can\'t go back to it after.',
        }).then(({ value }) => {
          if (value) {
            backHistory()
          }
        })
      } else {
        backHistory()
      }
    } else {
      App.exitApp()
    }
  }

  x.stack = [] as Array<BBHandler>

  return <Backbutton>x

})()

function doSet(path: string, replace = false) {
  // reset backbutton stack when changing route
  backbutton.stack = []
  previousPath = getPath()
  if (replace) {
    History.replaceState(undefined, path)
  } else {
    History.pushState(path)
  }
  const matched = router.run(path)
  if (!matched) router.run('/')
}

// sync call to router.set must be avoided in any `oninit` mithril component
// otherwise it makes mithril create another root component on top of the
// existing one
// making router.set async makes it safe everywhere
function setPath(path: string, replace = false): void {
  setTimeout(() => doSet(path, replace), 0)
}

function getPath(): string {
  const path = window.location.search || '?=/'
  return decodeURIComponent(path.substring(2))
}

function backHistory(): void {
  window.history.go(-1)
}

export default {
  get: getPath,
  set: setPath,
  reload(): void {
    setPath(getPath(), true)
  },
  setQueryParams,
  getQueryParams,
  deleteQueryParam,
  History,
  backHistory,
  getViewSlideDirection(): string {
    return viewSlideDirection
  },
  backbutton,
  getPreviousPath(): string {
    return previousPath
  },
}
