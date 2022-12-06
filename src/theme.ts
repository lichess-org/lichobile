import { Capacitor } from '@capacitor/core'
import { Toast } from '@capacitor/toast'
import { Filesystem, Directory, ReadFileResult } from '@capacitor/filesystem'
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar'
import settings from './settings'

const baseUrl = 'https://veloce.github.io/lichobile-themes'

let styleEl: HTMLStyleElement

type Theme = 'bg' | 'board'
interface ThemeEntry {
  key: string
  name: string
  ext: string
}

export function isTransparent(key: string) {
  return key !== 'dark' && key !== 'light' && key !== 'system'
}

export function init() {
  const bgTheme = settings.general.theme.background()
  const boardTheme = settings.general.theme.board()

  setStatusBarStyle(bgTheme)

  // load background theme
  if (isTransparent(bgTheme)) {
    const filename = getFilenameFromKey('bg', bgTheme)
    getLocalFile('bg', filename).then(r => {
      createStylesheetRule('bg', bgTheme, filename, r)
    })
    .catch(() => {
      settings.general.theme.background('dark')
    })
  }

  // load board theme
  if (!settings.general.theme.bundledBoardThemes.includes(boardTheme)) {
    const filename = getFilenameFromKey('board', boardTheme)
    getLocalFile('board', filename).then(r => {
      createStylesheetRule('board', boardTheme, filename, r)
    })
    .catch(() => {
      settings.general.theme.board('brown')
    })
  }
}

export function getLocalFile(theme: Theme, fileName: string): Promise<ReadFileResult> {
  return Filesystem.readFile({
    path: theme + '-' + fileName,
    directory: Directory.Data
  })
}

export function getLocalFiles(theme: Theme): Promise<readonly string[]> {
  return Filesystem.readdir({
    path: '',
    directory: Directory.Data
  }).then(({ files }) => files.map(f => f.name).filter(f => f.startsWith(theme)))
}

export function filename(entry: ThemeEntry): string {
  return entry.key + '.' + entry.ext
}

// either download it from server of get it from filesystem
export function loadImage(
  theme: Theme,
  key: string,
  onProgress: (e: ProgressEvent) => void
): Promise<void> {
  const filename = getFilenameFromKey(theme, key)
  return getLocalFile(theme, filename)
  .catch(() => {
    // if not found, download
    return download(theme, filename, onProgress)
    .then(() => getLocalFile(theme, filename))
  })
  .then(res => {
    createStylesheetRule(theme, key, filename, res)
  })
}

export function handleError(err: any) {
  console.error(err)
  Toast.show({ text: 'Cannot load theme file', duration: 'short' })
}

function createStylesheetRule(
  theme: Theme,
  key: string,
  filename: string,
  { data }: ReadFileResult
): void {
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.type = 'text/css'
    document.head.appendChild(styleEl)
  }
  const cleanData = data.replace(/\n/g, '') // FIXME should be fixed in capacitor
  const ext = filename.split('.').pop()
  const mime = ext === 'png' ?
    'data:image/png;base64,' : 'data:image/jpeg;base64,'
  const dataUrl = mime + cleanData
  const css = theme === 'bg' ?
    `.view-container.transp.${key} > main { background-image: url(${dataUrl}); }` :
    `:root { --board-background: url(${dataUrl}); }\n` +
    `.board-${key} > .cg-board { background-image: var(--board-background); }\n` +
    `.game_menu_button.${key}::before { background-image: var(--board-background); background-size: 40px; }`

  styleEl.appendChild(document.createTextNode(css))
}

function getFilenameFromKey(theme: Theme, key: string): string {
  const avails = theme === 'bg' ?
    settings.general.theme.availableBackgroundThemes :
    settings.general.theme.availableBoardThemes

  const t = avails.find(t => t.key === key)!

  return filename(t)
}

function download(
  theme: Theme,
  fileName: string,
  onProgress: (e: ProgressEvent) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new XMLHttpRequest()
    const themePath = theme === 'bg' ? '/background' : '/board'
    client.open('GET', `${baseUrl}${themePath}/${fileName}`, true)
      client.responseType = 'blob'
      if (onProgress) {
        client.onprogress = onProgress
      }
      client.onload = () => {
        if (client.status === 200) {
          const blob = client.response
          if (blob) {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
              const base64data = reader.result as string
              Filesystem.writeFile({
                path: theme + '-' + fileName,
                data: base64data,
                directory: Directory.Data,
              })
              .then(() => resolve())
            }
          } else {
            reject('could not get file')
          }
        } else {
          reject(`Request returned ${client.status}`)
        }
      }
      client.send()
  })
}

let systemTheme: string
export function getSystemTheme(): string {
  if (systemTheme === undefined) {
    const mql = window.matchMedia('(prefers-color-scheme: light)')
    systemTheme = mql.matches ? 'light' : 'dark'
    mql.addEventListener('change', e => {
      systemTheme = e.matches ? 'light' : 'dark'
    })
  }

  return systemTheme
}

export function setStatusBarStyle(key: string): Promise<void> {
  const bgTheme = key === 'system' ? getSystemTheme() : key
  return Promise.all([
    Capacitor.getPlatform() === 'android' ? StatusBar.setBackgroundColor({
      color: bgTheme === 'light' ? '#edebe9' :
        bgTheme === 'dark' ? '#161512' : '#000000'
    }) : Promise.resolve(),
    StatusBar.setStyle({
      style: bgTheme === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
    }),
    // StatusBar.setOverlaysWebView({
    //   overlay: isTransparent(bgTheme)
    // }),
  ]).then(() => { /* noop */ })
}

