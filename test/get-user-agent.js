const getUserAgent = require('../lib/get-user-agent.js')

const t = require('tap')

t.test('correctly generates a user-agent outside of ci', t => {
  const config = new Map(Object.entries({
    'user-agent': 'npm/{npm-version} node/{node-version} {platform} {arch} {ci}',
    'node-version': 'v14.12.0',
    'npm-version': '7.0.0',
    'ci-name': null
  }))

  const userAgent = getUserAgent(config)
  t.equal(userAgent, `npm/7.0.0 node/v14.12.0 ${process.platform} ${process.arch}`)
  t.end()
})

t.test('correctly generates a user-agent inside of ci', t => {
  const config = new Map(Object.entries({
    'user-agent': 'npm/{npm-version} node/{node-version} {platform} {arch} {ci}',
    'node-version': 'v14.12.0',
    'npm-version': '7.0.0',
    'ci-name': 'travis'
  }))

  const userAgent = getUserAgent(config)
  t.equal(userAgent, `npm/7.0.0 node/v14.12.0 ${process.platform} ${process.arch} ci/travis`)
  t.end()
})
