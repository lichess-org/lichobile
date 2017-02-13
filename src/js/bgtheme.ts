import * as filesystem from './utils/filesystem'

const baseUrl = 'https://raw.githubusercontent.com/veloce/lichobile-themes/master/background'
const imagePrefix = 'bg-'
let styleEl: HTMLStyleElement

// either download it from server of get it from filesystem
export function loadImage(fileName: string): Promise<void> {
  return filesystem.getLocalFileOrDowload(baseUrl + '/' + fileName, fileName, imagePrefix)
  .then(createStylesheetRule)
}

export function loadCachedImages() {
  filesystem.getFiles(imagePrefix)
  .then((files: FileEntry[]) => {
    files.forEach(createStylesheetRule)
  })
}

export function handleError(err: FileError | FileTransferError) {
  if (filesystem.isFileTransfertError(err)) {
    window.plugins.toast.show('Error while downloading file from server. Please try later.', 'long', 'center');
  } else {
    window.plugins.toast.show('Cannot load theme file', 'long', 'center');
  }
}

function createStylesheetRule(entry: FileEntry) {
  if (!styleEl) {
    styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
  }
  const sheet = <CSSStyleSheet>styleEl.sheet
  const theme = entry.name.replace(/^bg-([a-z-_]+).\w+$/, '$1')
  sheet.insertRule(
    `.view-container.transp.${theme} > main::before { background-image: url(${entry.toURL()}) }`,
    sheet.cssRules.length
  );
}
