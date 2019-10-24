import { Capacitor, Plugins, FilesystemDirectory, FileReadResult } from '@capacitor/core'
import settings from './settings'

const { Filesystem } = Plugins

const baseUrl = 'https://veloce.github.io/lichobile-themes/background'
const imagePrefix = 'bg-'
let styleEl: HTMLStyleElement

export function getThemeFilename(key: string): string {
  const t = settings.general.theme.availableBackgroundThemes.find(t => t.key === key)!
  return t.key + '.' + t.ext
}

export function getLocalFile(fileName: string): Promise<FileReadResult> {
  return Filesystem.readFile({
    path: imagePrefix + fileName,
    directory: FilesystemDirectory.Data
  })
}

// either download it from server of get it from filesystem
export function loadImage(
  theme: string,
  onProgress: (e: ProgressEvent) => void
): Promise<void> {
  const fileName = getThemeFilename(theme)
  const remoteFileUri = baseUrl + '/' + fileName
  return getLocalFile(fileName)
  .catch(() => {
    // if not found, download
    return download(fileName, remoteFileUri, onProgress)
    .then(() => getLocalFile(fileName))
  })
  .then(r => createStylesheetRule(theme, r))
}

export function handleError(err: any) {
  console.error(err)
  Plugins.Toast.show({ text: 'Cannot load theme file', duration: 'long' })
}

export function createStylesheetRule(theme: string, { data }: FileReadResult): void {
  if (!styleEl) {
    styleEl = document.createElement('style')
    document.head.appendChild(styleEl)
  }
  // FIXME should be fixed in capacitor
  const cleanData = data.replace(/\n/g, '')
  const mime = Capacitor.platform === 'web' ? '' :
    (theme === 'checkerboard' ? 'data:image/png;base64,' : 'data:image/jpeg;base64,')
  const dataUrl = mime + cleanData
  const css =
    `.view-container.transp.${theme} > main { background-image: url(${dataUrl}); }`
  styleEl.type = 'text/css'
  styleEl.appendChild(document.createTextNode(css))
}

function download(
  fileName: string,
  remoteURI: string,
  onProgress?: (e: ProgressEvent) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new XMLHttpRequest()
    client.open('GET', remoteURI, true)
      client.responseType = 'blob'
      if (onProgress) {
        client.onprogress = onProgress
      }
      client.onload = () => {
        const blob = client.response
        if (blob) {
          const reader = new FileReader()
          reader.readAsDataURL(blob)
          reader.onloadend = () => {
            const base64data = reader.result as string
            Filesystem.writeFile({
              path: imagePrefix + fileName,
              data: base64data,
              directory: FilesystemDirectory.Data,
            })
            .then(() => resolve())
          }
        } else {
          reject('could not get file')
        }
      }
      client.send()
  })
}
