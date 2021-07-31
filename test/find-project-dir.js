const t = require('tap')
const findProjectDir = require('../lib/find-project-dir.js')
const { resolve } = require('path')

t.test('walk up, but do not pass end', async t => {
  const path = t.testdir({
    hasnm: {
      node_modules: {},
      a: { b: { c: {}}},
    },
    haspj: {
      'package.json': JSON.stringify({}),
      a: { b: { c: {}}},
    },
  })
  t.equal(
    await findProjectDir(resolve(`${path}/hasnm/a/b/c`)),
    resolve(path, 'hasnm')
  )
  t.equal(
    await findProjectDir(resolve(`${path}/haspj/a/b/c`)),
    resolve(path, 'haspj')
  )
  t.equal(
    await findProjectDir(resolve(`${path}/haspj/a/b/c`), resolve(path, 'haspj/a')),
    resolve(path, 'haspj/a/b/c')
  )
})
