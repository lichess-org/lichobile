// Implementation originally from Twitter's Hogan.js:
// https://github.com/twitter/hogan.js/blob/master/lib/template.js#L325-L335
const rAmp = /&/g
const rLt = /</g
const rGt = />/g
const rApos = /'/g
const rQuot = /"/g
const hChars = /[&<>"']/
export function escapeHtml(str: string) {
  if (hChars.test(String(str))) {
    return str
    .replace(rAmp, '&amp;')
    .replace(rLt, '&lt;')
    .replace(rGt, '&gt;')
    .replace(rApos, '&apos;')
    .replace(rQuot, '&quot;')
  }
  else {
    return str
  }
}

export function linkify(text: string): string {
  const escaped = escapeHtml(text)
  const linked = autoLink(escaped)
  return linked
}

const linkPattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:(?:https?):\/\/|lichess\.org\/)[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/gi

function linkReplace(match: string, before: string, url: string) {
  if (url.indexOf('&quot;') !== -1) return match
  const fullUrl = url.indexOf('http') === 0 ? url : 'https://' + url
  const minUrl = url.replace(/^(?:https:\/\/)?(.+)$/, '$1')
  return before + `<a class="external_link" onClick="window.open('${fullUrl}', '_blank')">${minUrl}</a>`
}

const userPattern = /(^|[^\w@#/])@([\w-]{2,})/g

function userLinkReplace(orig: string, prefix: string, user: string) {
  if (user.length > 20) return orig
  return prefix + `<a href="?/@/${user}">@${user}</a>`
}

function autoLink(html: string) {
  return html.replace(userPattern, userLinkReplace).replace(linkPattern, linkReplace)
}
