const setEnvs = require('../lib/set-envs.js')

const t = require('tap')
const defaults = require('./fixtures/defaults.js')
const { execPath } = process

t.test('set envs that are not defaults and not already in env', t => {
  const envConf = Object.create(defaults)
  const cliConf = Object.create(envConf)
  const extras = {
    EDITOR: 'vim',
    HOME: undefined,
    PREFIX: undefined,
    npm_execpath: require.main.filename,
    npm_node_execpath: execPath,
  }

  const env = {}
  const config = { list: [cliConf, envConf], env, defaults, execPath }

  setEnvs(config)

  t.strictSame(env, { ...extras }, 'no new environment vars to create')
  envConf.call = 'me, maybe'
  setEnvs(config)
  t.strictSame(env, { ...extras }, 'no new environment vars to create, already in env')
  delete envConf.call
  cliConf.call = 'me, maybe'
  setEnvs(config)
  t.strictSame(env, {
    ...extras,
    npm_config_call: 'me, maybe'
  }, 'set in env, because changed from default in cli')
  envConf.call = 'me, maybe'
  cliConf.call = ''
  cliConf['node-options'] = 'some options for node'
  setEnvs(config)
  t.strictSame(env, {
    ...extras,
    npm_config_call: '',
    npm_config_node_options: 'some options for node',
    NODE_OPTIONS: 'some options for node'
  }, 'set in env, because changed from default in env, back to default in cli')
  t.end()
})

t.test('set envs that are not defaults and not already in env, array style', t => {
  const envConf = Object.create(defaults)
  const cliConf = Object.create(envConf)
  const extras = {
    EDITOR: 'vim',
    HOME: undefined,
    PREFIX: undefined,
    npm_execpath: require.main.filename,
    npm_node_execpath: execPath,
  }
  const env = {}
  const config = { list: [cliConf, envConf], env, defaults, execPath }
  setEnvs(config)
  t.strictSame(env, { ...extras }, 'no new environment vars to create')

  envConf.omit = ['dev']
  setEnvs(config)
  t.strictSame(env, { ...extras }, 'no new environment vars to create, already in env')
  delete envConf.omit
  cliConf.omit = ['dev', 'optional']
  setEnvs(config)
  t.strictSame(env, {
    ...extras,
    npm_config_omit: 'dev\n\noptional'
  }, 'set in env, because changed from default in cli')
  envConf.omit = ['optional', 'peer']
  cliConf.omit = []
  setEnvs(config)
  t.strictSame(env, {
    ...extras,
    npm_config_omit: ''
  }, 'set in env, because changed from default in env, back to default in cli')
  t.end()
})


t.test('set envs that are not defaults and not already in env, boolean edition', t => {
  const envConf = Object.create(defaults)
  const cliConf = Object.create(envConf)
  const extras = {
    EDITOR: 'vim',
    HOME: undefined,
    PREFIX: undefined,
    npm_execpath: require.main.filename,
    npm_node_execpath: execPath,
  }

  const env = {}
  const config = { list: [cliConf, envConf], env, defaults, execPath }
  setEnvs(config)
  t.strictSame(env, { ...extras }, 'no new environment vars to create')
  envConf.audit = false
  setEnvs(config)
  t.strictSame(env, { ...extras }, 'no new environment vars to create, already in env')
  delete envConf.audit
  cliConf.audit = false
  cliConf.ignoreObjects = {
    some: { object: 12345 }
  }
  setEnvs(config)
  t.strictSame(env, {
    ...extras,
    npm_config_audit: ''
  }, 'set in env, because changed from default in cli')
  envConf.audit = false
  cliConf.audit = true
  setEnvs(config)
  t.strictSame(env, {
    ...extras,
    npm_config_audit: 'true'
  }, 'set in env, because changed from default in env, back to default in cli')
  t.end()
})

t.test('set PREFIX based on DESTDIR', t => {
  // also, don't set editor
  const d = { ...defaults, editor: null }
  const envConf = Object.create(d)
  const cliConf = Object.create(envConf)
  const extras = {
    HOME: undefined,
    PREFIX: '/usr/local',
    DESTDIR: '/some/dest',
    npm_execpath: require.main.filename,
    npm_node_execpath: execPath,
  }
  const env = { DESTDIR: '/some/dest' }
  const config = {
    list: [cliConf, envConf],
    env,
    defaults: d,
    globalPrefix: '/some/dest/usr/local',
    execPath,
  }
  setEnvs(config)
  t.strictSame(env, { ...extras })
  t.end()
})
