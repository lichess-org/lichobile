import { Plugins, FilesystemDirectory, FileReadResult } from '@capacitor/core'
import settings from './settings'

const { Filesystem } = Plugins
const baseUrl = 'https://veloce.github.io/lichobile-themes'

let styleEl: HTMLStyleElement

type Theme = 'bg' | 'board'
interface ThemeEntry {
  key: string
  name: string
  ext: string
}

export function getLocalFile(theme: Theme, fileName: string): Promise<FileReadResult> {
  return Filesystem.readFile({
    path: theme + '-' + fileName,
    directory: FilesystemDirectory.Data
  })
}

export function getLocalFiles(theme: Theme): Promise<readonly string[]> {
  return Filesystem.readdir({
    path: '',
    directory: FilesystemDirectory.Data
  }).then(({ files }) => files.filter(f => f.startsWith(theme)))
}

export function getFilenameFromKey(theme: Theme, key: string): string {
  const avails = theme === 'bg' ?
    settings.general.theme.availableBackgroundThemes :
    settings.general.theme.availableBoardThemes

  const t = avails.find(t => t.key === key)!

  return filename(t)
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
  Plugins.LiToast.show({ text: 'Cannot load theme file', duration: 'long' })
}

export function createStylesheetRule(
  theme: Theme,
  key: string,
  filename: string,
  { data }: FileReadResult
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
    `.${key} > .cg-board { background-image: url(${dataUrl}); }`

  styleEl.appendChild(document.createTextNode(css))
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
                directory: FilesystemDirectory.Data,
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
