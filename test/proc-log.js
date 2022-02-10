const log = require('proc-log')
const t = require('tap')
const logs = []
process.on('log', (...msg) => logs.push(msg))
log.silly('OpAn SauCE lOl')
log.verbose('WHEN I WROTE the following pages, or rather the bulk of them, I lived alone,' +
  ' in the woods, a mile from any neighbor, in a house which I had built myself, on the shore' +
  ' of Walden Pond, in Concord, Massachusetts, and earned my living by the labor of my hands only' +
  '. I lived there two years and two months. At present I am a sojourner in civilized life again.')
log.warn('cave canem')
log.error('i wrote a message but i accidentally it')

t.strictSame(logs, [
  ['silly', 'OpAn SauCE lOl'],
  [
    'verbose',
    'WHEN I WROTE the following pages, or rather the bulk of them, I lived alone,' +
    ' in the woods, a mile from any neighbor, in a house which I had built myself, on the shore' +
    ' of Walden Pond, in Concord, Massachusetts, and earned my living by the labor of my hands' +
    ' only. I lived there two years and two months. At present I am a sojourner in civilized' +
    ' life again.',
  ],
  ['warn', 'cave canem'],
  ['error', 'i wrote a message but i accidentally it'],
])
