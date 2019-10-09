import moment from 'moment'

window.moment = moment

// Round relative time evaluation down
window.moment.relativeTimeRounding(Math.floor)

window.moment.relativeTimeThreshold('s', 60)
window.moment.relativeTimeThreshold('m', 60)
window.moment.relativeTimeThreshold('h', 24)
window.moment.relativeTimeThreshold('d', 31)
window.moment.relativeTimeThreshold('M', 12)
