// Implementation originally from Twitter's Hogan.js:
// https://github.com/twitter/hogan.js/blob/master/lib/template.js#L325-L335
const rAmp = /&/g
const rLt = /</g
const rApos = /\'/g
const rQuot = /\"/g
const hChars = /[&<>\"\']/

export function escape(str: string) {
  if (hChars.test(String(str))) {
    return str
    .replace(rAmp, '&amp;')
    .replace(rLt, '&lt;')
    .replace(rApos, '&apos;')
    .replace(rQuot, '&quot;')
  }
  else {
    return str
  }
}
