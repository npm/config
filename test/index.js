const t = require('tap')

// hackedy hacky hack
const fs = require('fs')
const { readFile, readFileSync } = fs
fs.readFile = (path, ...args) => {
  if (path && path.match(/WEIRD-ERROR/)) {
    const cb = args.pop()
    cb(Object.assign(new Error('weird error'), { code: 'EWEIRD' }))
  } else
    return readFile(path, ...args)
}
fs.readFileSync = (path, ...args) => {
  if (path.match(/WEIRD-ERROR/))
    throw Object.assign(new Error('weird error'), { code: 'EWEIRD' })
  else
    return readFileSync(path, ...args)
}

// when running with `npm test` it adds environment variables that
// mess with the things we expect here, so delete all of those.
Object.keys(process.env)
  .filter(k => /^npm_/.test(k))
  .forEach(k => delete process.env[k])
delete process.env.PREFIX
delete process.env.DESTDIR

const definitions = require('./fixtures/definitions.js')
const shorthands = require('./fixtures/shorthands.js')
const flatten = require('./fixtures/flatten.js')
const typeDefs = require('../lib/type-defs.js')

const { resolve, join, dirname } = require('path')

const Config = require('../')

t.equal(typeDefs, Config.typeDefs, 'exposes type definitions')

t.test('construct with no settings, get default values for stuff', t => {
  const npmPath = t.testdir()
  const c = new Config({
    definitions: {},
    npmPath,
  })

  t.test('default some values from process object', t => {
    const { env, execPath, platform } = process
    const cwd = process.cwd()
    t.equal(c.env, env, 'env')
    t.equal(c.execPath, execPath, 'execPath')
    t.equal(c.cwd, cwd, 'cwd')
    t.equal(c.platform, platform, 'platform')
    t.end()
  })

  t.test('not loaded yet', t => {
    t.equal(c.loaded, false, 'not loaded yet')
    t.throws(() => c.get('foo'), {
      message: 'call config.load() before reading values',
    })
    t.throws(() => c.find('foo'), {
      message: 'call config.load() before reading values',
    })
    t.throws(() => c.set('foo', 'bar'), {
      message: 'call config.load() before setting values',
    })
    t.throws(() => c.delete('foo'), {
      message: 'call config.load() before deleting values',
    })
    t.rejects(() => c.save('user'), {
      message: 'call config.load() before saving',
    })
    t.throws(() => c.data.set('user', {}), {
      message: 'cannot change internal config data structure',
    })
    t.throws(() => c.data.delete('user'), {
      message: 'cannot change internal config data structure',
    })
    t.end()
  })

  t.test('data structure all wired up properly', t => {
    // verify that the proto objects are all wired up properly
    c.list.forEach((data, i) => {
      t.equal(Object.getPrototypeOf(data), c.list[i + 1] || null)
    })
    t.equal(c.data.get('default').data, c.list[c.list.length - 1])
    t.equal(c.data.get('cli').data, c.list[0])
    t.end()
  })

  t.end()
})

t.test('load from files and environment variables', t => {
  // need to get the dir because we reference it in the contents
  const path = t.testdir()
  t.testdir({
    npm: {
      npmrc: `
builtin-config = true
foo = from-builtin
userconfig = ${path}/user/.npmrc-from-builtin
`,
    },
    global: {
      etc: {
        npmrc: `
global-config = true
foo = from-global
userconfig = ${path}/should-not-load-this-file
`,
      },
    },
    user: {
      '.npmrc': `
default-user-config-in-home = true
foo = from-default-userconfig
prefix = ${path}/global
`,
      '.npmrc-from-builtin': `
user-config-from-builtin = true
foo = from-custom-userconfig
globalconfig = ${path}/global/etc/npmrc
`,
    },
    project: {
      node_modules: {},
      '.npmrc': `
project-config = true
foo = from-project-config
loglevel = yolo
`,
    },
    'project-no-config': {
      'package.json': '{"name":"@scope/project"}',
    },
  })

  const logs = []
  const log = {
    warn: (...msg) => logs.push(['warn', ...msg]),
    verbose: (...msg) => logs.push(['verbose', ...msg]),
  }

  const argv = [
    process.execPath,
    __filename,
    '-v',
    '--no-audit',
    'config',
    'get',
    'foo',
    '--also=dev',
    '--registry=hello',
    '--omit=cucumber',
    '--access=blueberry',
    '--multiple-numbers=what kind of fruit is not a number',
    '--multiple-numbers=a baNaNa!!',
    '-C',
  ]

  t.test('dont let userconfig be the same as builtin config', async t => {
    const config = new Config({
      npmPath: `${path}/npm`,
      env: {},
      argv: [process.execPath, __filename, '--userconfig', `${path}/npm/npmrc`],
      cwd: `${path}/project`,
      shorthands,
      definitions,
    })
    await t.rejects(() => config.load(), {
      message: `double-loading config "${resolve(path, 'npm/npmrc')}" as "user", previously loaded as "builtin"`,
    })
  })

  t.test('verbose log if config file read is weird error', async t => {
    const config = new Config({
      npmPath: path,
      env: {},
      argv: [process.execPath, __filename, '--userconfig', `${path}/WEIRD-ERROR`],
      cwd: path,
      log,
      shorthands,
      definitions,
    })
    logs.length = 0
    await config.load()
    t.match(logs, [['verbose', 'config', 'error loading user config', {
      message: 'weird error',
    }]])
    logs.length = 0
  })

  t.test('load configs from all files, cli, and env', async t => {
    const env = {
      npm_config_foo: 'from-env',
      npm_config_global: '',
      npm_config_prefix: '/something',
    }
    const config = new Config({
      npmPath: `${path}/npm`,
      env,
      argv,
      log,
      cwd: `${path}/project`,

      shorthands,
      definitions,
    })

    t.equal(config.globalPrefix, null, 'globalPrefix missing before load')

    await config.load()

    t.equal(config.globalPrefix, resolve('/something'), 'env-defined prefix should have been loaded')

    t.equal(config.get('global', 'env'), undefined, 'empty env is missing')
    t.equal(config.get('global'), false, 'empty env is missing')

    config.set('asdf', 'quux', 'global')
    await config.save('global')
    const gres = readFileSync(`${path}/global/etc/npmrc`, 'utf8')
    t.match(gres, 'asdf=quux')

    const cliData = config.data.get('cli')
    t.throws(() => cliData.loadError = true, {
      message: 'cannot set ConfigData loadError after load',
    })
    t.throws(() => cliData.source = 'foo', {
      message: 'cannot set ConfigData source more than once',
    })
    t.throws(() => cliData.raw = 1234, {
      message: 'cannot set ConfigData raw after load',
    })

    config.argv = []

    t.throws(() => config.loadCLI(), {
      message: 'double-loading "cli" configs from command line options, previously loaded from command line options',
    })
    t.rejects(() => config.loadUserConfig(), {
      message: `double-loading "user" configs from ${resolve(path, 'should-not-load-this-file')}, previously loaded from ${resolve(path, 'user/.npmrc-from-builtin')}`,
    })

    t.equal(config.loaded, true, 'config is loaded')

    await t.rejects(() => config.load(), {
      message: 'attempting to load npm config multiple times',
    })
    t.equal(config.find('no config value here'), null)

    t.equal(config.prefix, config.localPrefix, 'prefix is local prefix when not global')
    config.set('global', true)
    t.equal(config.prefix, config.globalPrefix, 'prefix is global prefix when global')
    config.set('global', false)
    t.equal(config.find('global'), 'cli')
    config.delete('global')
    t.equal(config.find('global'), 'default')

    t.throws(() => config.get('foo', 'barbaz'), {
      message: 'invalid config location param: barbaz',
    })
    t.throws(() => config.set('foo', 1234, 'barbaz'), {
      message: 'invalid config location param: barbaz',
    })
    t.throws(() => config.delete('foo', 'barbaz'), {
      message: 'invalid config location param: barbaz',
    })

    t.match(config.sources, new Map([
      ['default values', 'default'],
      [resolve(path, 'npm/npmrc'), 'builtin'],
      ['command line options', 'cli'],
      ['environment', 'env'],
      [resolve(path, 'project/.npmrc'), 'project'],
      [resolve(path, 'user/.npmrc-from-builtin'), 'user'],
      [resolve(path, 'global/etc/npmrc'), 'global'],
    ]))

    t.strictSame({
      version: config.get('version'),
      audit: config.get('audit'),
      'project-config': config.get('project-config'),
      foo: config.get('foo'),
      'user-config-from-builtin': config.get('user-config-from-builtin'),
      'global-config': config.get('global-config'),
      'builtin-config': config.get('builtin-config'),
      all: config.get('all'),
    }, {
      version: true,
      audit: false,
      'project-config': true,
      foo: 'from-env',
      'user-config-from-builtin': true,
      'global-config': true,
      'builtin-config': true,
      all: config.get('all'),
    })

    t.match(env, {
      npm_config_user_config_from_builtin: 'true',
      npm_config_audit: '',
      npm_config_version: 'true',
      npm_config_foo: 'from-env',
      npm_config_builtin_config: 'true',
    }, 'set env values')

    t.strictSame(logs, [
      ['warn', 'invalid config', 'registry="hello"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be', 'full url with "http://"'],
      ['warn', 'invalid config', 'omit="cucumber"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one or more of:', 'dev, optional, peer'],
      ['warn', 'invalid config', 'access="blueberry"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one of:', 'null, restricted, public'],
      ['warn', 'invalid config', 'multiple-numbers="what kind of fruit is not a number"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one or more', 'numeric value'],
      ['warn', 'invalid config', 'multiple-numbers="a baNaNa!!"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one or more', 'numeric value'],
      ['warn', 'invalid config', 'prefix=true', 'set in command line options'],
      ['warn', 'invalid config', 'Must be', 'valid filesystem path'],
      ['verbose', 'config', 'also', 'Please use --include=dev instead.'],
      ['warn', 'invalid config', 'loglevel="yolo"',
        `set in ${resolve(path, 'project/.npmrc')}`],
      ['warn', 'invalid config', 'Must be one of:',
        ['silent', 'error', 'warn', 'notice', 'http', 'timing', 'info',
          'verbose', 'silly'].join(', '),
      ],
    ])
    t.equal(config.valid, false)
    logs.length = 0
  })

  t.test('do not double-load project/user config', async t => {
    const env = {
      npm_config_foo: 'from-env',
      npm_config_globalconfig: '/this/path/does/not/exist',
    }

    const config = new Config({
      npmPath: `${path}/npm`,
      env,
      argv: [process.execPath, __filename, '--userconfig', `${path}/project/.npmrc`],
      cwd: `${path}/project`,

      shorthands,
      definitions,
    })
    await config.load()

    config.argv = []
    t.equal(config.loaded, true, 'config is loaded')

    t.match(config.data.get('global').loadError, { code: 'ENOENT' })
    t.strictSame(config.data.get('env').raw, Object.assign(Object.create(null), {
      foo: 'from-env',
      globalconfig: '/this/path/does/not/exist',
    }))

    t.match(config.sources, new Map([
      ['default values', 'default'],
      [resolve(path, 'npm/npmrc'), 'builtin'],
      ['command line options', 'cli'],
      ['environment', 'env'],
      ['(workspace same as "user" config, ignored)', 'workspace'],
      ['(project same as "user" config, ignored)', 'project'],
      [resolve(path, 'project/.npmrc'), 'user'],
    ]))

    t.rejects(() => config.save('yolo'), {
      message: 'invalid config location param: yolo',
    })
    t.equal(config.valid, false, 'config should not be valid')
  })

  t.test('load configs from files, cli, and env, no builtin or project', async t => {
    const env = {
      npm_config_foo: 'from-env',
      HOME: `${path}/user`,
    }

    const config = new Config({
      // no builtin
      npmPath: path,
      env,
      argv,
      log,
      cwd: `${path}/project-no-config`,

      // should prepend DESTDIR to /global
      DESTDIR: path,
      PREFIX: '/global',
      platform: 'posix',

      shorthands,
      definitions,
    })
    await config.load()

    t.match(config.sources, new Map([
      ['default values', 'default'],
      ['command line options', 'cli'],
      ['environment', 'env'],
      [resolve(path, 'user/.npmrc'), 'user'],
      [resolve(path, 'global/etc/npmrc'), 'global'],
    ]))
    // no builtin or project config
    t.equal(config.sources.get(resolve(path, 'npm/npmrc')), undefined)
    t.equal(config.sources.get(resolve(path, 'project/.npmrc')), undefined)

    t.strictSame({
      version: config.get('version'),
      audit: config.get('audit'),
      'project-config': config.get('project-config'),
      foo: config.get('foo'),
      'user-config-from-builtin': config.get('user-config-from-builtin'),
      'default-user-config-in-home': config.get('default-user-config-in-home'),
      'global-config': config.get('global-config'),
      'builtin-config': config.get('builtin-config'),
      all: config.get('all'),
    }, {
      version: true,
      audit: false,
      'project-config': undefined,
      foo: 'from-env',
      'user-config-from-builtin': undefined,
      'default-user-config-in-home': true,
      'global-config': true,
      'builtin-config': undefined,
      all: config.get('all'),
    })

    t.strictSame(logs, [
      ['warn', 'invalid config', 'registry="hello"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be', 'full url with "http://"'],
      ['warn', 'invalid config', 'omit="cucumber"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one or more of:', 'dev, optional, peer'],
      ['warn', 'invalid config', 'access="blueberry"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one of:', 'null, restricted, public'],
      ['warn', 'invalid config', 'multiple-numbers="what kind of fruit is not a number"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one or more', 'numeric value'],
      ['warn', 'invalid config', 'multiple-numbers="a baNaNa!!"', 'set in command line options'],
      ['warn', 'invalid config', 'Must be one or more', 'numeric value'],
      ['warn', 'invalid config', 'prefix=true', 'set in command line options'],
      ['warn', 'invalid config', 'Must be', 'valid filesystem path'],
      ['verbose', 'config', 'also', 'Please use --include=dev instead.'],
    ])
  })

  t.end()
})

t.test('cafile loads as ca (and some saving tests)', async t => {
  const cafile = resolve(__dirname, 'fixtures', 'cafile')
  const dir = t.testdir({
    '.npmrc': `cafile = ${cafile}
_authToken = deadbeefcafebadfoobarbaz42069
`,
  })
  const expect = `cafile=${cafile}
//registry.npmjs.org/:_authToken=deadbeefcafebadfoobarbaz42069
`

  const config = new Config({
    shorthands,
    definitions,
    npmPath: __dirname,
    env: { HOME: dir, PREFIX: dir },
    flatten,
  })
  await config.load()
  t.equal(config.get('ca'), null, 'does not overwrite config.get')
  const { flat } = config
  t.equal(config.flat, flat, 'getter returns same value again')
  const ca = flat.ca
  t.equal(ca.join('\n').replace(/\r\n/g, '\n').trim(), readFileSync(cafile, 'utf8').replace(/\r\n/g, '\n').trim())
  await config.save('user')
  const res = readFileSync(`${dir}/.npmrc`, 'utf8').replace(/\r\n/g, '\n')
  t.equal(res, expect, 'did not write back ca, only cafile')
  // while we're here, test that saving an empty config file deletes it
  config.delete('cafile', 'user')
  config.clearCredentialsByURI(config.get('registry'))
  await config.save('user')
  t.throws(() => readFileSync(`${dir}/.npmrc`, 'utf8'), { code: 'ENOENT' })
  // do it again to verify we ignore the unlink error
  await config.save('user')
  t.throws(() => readFileSync(`${dir}/.npmrc`, 'utf8'), { code: 'ENOENT' })
  t.equal(config.valid, true)
})

t.test('cafile ignored if ca set', async t => {
  const cafile = resolve(__dirname, 'fixtures', 'cafile')
  const dir = t.testdir({
    '.npmrc': `cafile = ${cafile}`,
  })
  const ca = `
-----BEGIN CERTIFICATE-----
fakey mc fakerson
-----END CERTIFICATE-----
`
  const config = new Config({
    shorthands,
    definitions,
    npmPath: __dirname,
    env: {
      HOME: dir,
      npm_config_ca: ca,
    },
  })
  await config.load()
  t.strictSame(config.get('ca'), [ca.trim()])
  await config.save('user')
  const res = readFileSync(`${dir}/.npmrc`, 'utf8')
  t.equal(res.trim(), `cafile=${cafile}`)
})

t.test('ignore cafile if it does not load', async t => {
  const cafile = resolve(__dirname, 'fixtures', 'cafile-does-not-exist')
  const dir = t.testdir({
    '.npmrc': `cafile = ${cafile}`,
  })
  const config = new Config({
    shorthands,
    definitions,
    npmPath: __dirname,
    env: { HOME: dir },
  })
  await config.load()
  t.equal(config.get('ca'), null)
  await config.save('user')
  const res = readFileSync(`${dir}/.npmrc`, 'utf8')
  t.equal(res.trim(), `cafile=${cafile}`)
})

t.test('raise error if reading ca file error other than ENOENT', async t => {
  const cafile = resolve(__dirname, 'fixtures', 'WEIRD-ERROR')
  const dir = t.testdir({
    '.npmrc': `cafile = ${cafile}`,
  })
  const config = new Config({
    shorthands,
    definitions,
    npmPath: __dirname,
    env: { HOME: dir },
    flatten,
  })
  await config.load()
  t.throws(() => config.flat.ca, { code: 'EWEIRD' })
})

t.test('credentials management', async t => {
  const fixtures = {
    nerfed_authToken: { '.npmrc': '//registry.example/:_authToken = 0bad1de4' },
    nerfed_lcAuthToken: { '.npmrc': '//registry.example/:_authtoken = 0bad1de4' },
    nerfed_userpass: {
      '.npmrc': `//registry.example/:username = hello
//registry.example/:_password = ${Buffer.from('world').toString('base64')}
//registry.example/:email = i@izs.me
//registry.example/:always-auth = "false"`,
    },
    nerfed_auth: { // note: does not load, because we don't do _auth per reg
      '.npmrc': `//registry.example/:_auth = ${Buffer.from('hello:world').toString('base64')}`,
    },
    def_userpass: {
      '.npmrc': `username = hello
_password = ${Buffer.from('world').toString('base64')}
email = i@izs.me
//registry.example/:always-auth = true
`,
    },
    def_userNoPass: {
      '.npmrc': `username = hello
email = i@izs.me
//registry.example/:always-auth = true
`,
    },
    def_passNoUser: {
      '.npmrc': `_password = ${Buffer.from('world').toString('base64')}
email = i@izs.me
//registry.example/:always-auth = true
`,
    },
    def_auth: {
      '.npmrc': `_auth = ${Buffer.from('hello:world').toString('base64')}
always-auth = true`,
    },
    none_authToken: { '.npmrc': '_authToken = 0bad1de4' },
    none_lcAuthToken: { '.npmrc': '_authtoken = 0bad1de4' },
    none_emptyConfig: { '.npmrc': '' },
    none_noConfig: {},
  }
  const path = t.testdir(fixtures)

  const defReg = 'https://registry.example/'
  const otherReg = 'https://other.registry/'
  for (const testCase of Object.keys(fixtures)) {
    t.test(testCase, async t => {
      const c = new Config({
        npmPath: path,
        shorthands,
        definitions,
        env: { HOME: resolve(path, testCase) },
        argv: ['node', 'file', '--registry', defReg],
      })
      await c.load()

      // only have to do this the first time, it's redundant otherwise
      if (testCase === 'none_noConfig') {
        t.throws(() => c.setCredentialsByURI('http://x.com', {
          username: 'foo',
          email: 'bar@baz.com',
        }), { message: 'must include password' })
        t.throws(() => c.setCredentialsByURI('http://x.com', {
          password: 'foo',
          email: 'bar@baz.com',
        }), { message: 'must include username' })
        c.setCredentialsByURI('http://x.com', {
          username: 'foo',
          password: 'bar',
          email: 'asdf@quux.com',
        })
      }

      const d = c.getCredentialsByURI(defReg)
      const o = c.getCredentialsByURI(otherReg)

      t.matchSnapshot(d, 'default registry')
      t.matchSnapshot(o, 'other registry')

      c.clearCredentialsByURI(defReg)
      const defAfterDelete = c.getCredentialsByURI(defReg)
      {
        const expectKeys = []
        if (defAfterDelete.email)
          expectKeys.push('email')
        t.strictSame(Object.keys(defAfterDelete), expectKeys)
      }

      c.clearCredentialsByURI(otherReg)
      const otherAfterDelete = c.getCredentialsByURI(otherReg)
      {
        const expectKeys = []
        if (otherAfterDelete.email)
          expectKeys.push('email')
        t.strictSame(Object.keys(otherAfterDelete), expectKeys)
      }

      // need both or none of user/pass
      if (!d.token && (!d.username || !d.password))
        t.throws(() => c.setCredentialsByURI(defReg, d))
      else {
        c.setCredentialsByURI(defReg, d)
        t.matchSnapshot(c.getCredentialsByURI(defReg), 'default registry after set')
      }

      if (!o.token && (!o.username || !o.password))
        t.throws(() => c.setCredentialsByURI(otherReg, o), {}, { otherReg, o })
      else {
        c.setCredentialsByURI(otherReg, o)
        t.matchSnapshot(c.getCredentialsByURI(otherReg), 'other registry after set')
      }
    })
  }
  t.end()
})

t.test('finding the global prefix', t => {
  const npmPath = __dirname
  t.test('load from PREFIX env', t => {
    const c = new Config({
      env: {
        PREFIX: '/prefix/env',
      },
      shorthands,
      definitions,
      npmPath,
    })
    c.loadGlobalPrefix()
    t.throws(() => c.loadGlobalPrefix(), {
      message: 'cannot load default global prefix more than once',
    })
    t.equal(c.globalPrefix, '/prefix/env')
    t.end()
  })
  t.test('load from execPath, win32', t => {
    const c = new Config({
      platform: 'win32',
      execPath: '/path/to/nodejs/node.exe',
      shorthands,
      definitions,
      npmPath,
    })
    c.loadGlobalPrefix()
    t.equal(c.globalPrefix, dirname('/path/to/nodejs/node.exe'))
    t.end()
  })
  t.test('load from execPath, posix', t => {
    const c = new Config({
      platform: 'posix',
      execPath: '/path/to/nodejs/bin/node',
      shorthands,
      definitions,
      npmPath,
    })
    c.loadGlobalPrefix()
    t.equal(c.globalPrefix, dirname(dirname('/path/to/nodejs/bin/node')))
    t.end()
  })
  t.test('load from execPath with destdir, posix', t => {
    const c = new Config({
      platform: 'posix',
      execPath: '/path/to/nodejs/bin/node',
      env: { DESTDIR: '/some/dest/dir' },
      shorthands,
      definitions,
      npmPath,
    })
    c.loadGlobalPrefix()
    t.equal(c.globalPrefix, join('/some/dest/dir', dirname(dirname('/path/to/nodejs/bin/node'))))
    t.end()
  })
  t.end()
})

t.test('finding the local prefix', t => {
  const path = t.testdir({
    hasNM: {
      node_modules: {},
      x: { y: { z: {}}},
    },
    hasPJ: {
      'package.json': '{}',
      x: { y: { z: {}}},
    },
  })
  t.test('explicit cli prefix', async t => {
    const c = new Config({
      argv: [process.execPath, __filename, '-C', path],
      shorthands,
      definitions,
      npmPath: path,
    })
    await c.load()
    t.equal(c.localPrefix, resolve(path))
  })
  t.test('has node_modules', async t => {
    const c = new Config({
      cwd: `${path}/hasNM/x/y/z`,
      shorthands,
      definitions,
      npmPath: path,
    })
    await c.load()
    t.equal(c.localPrefix, resolve(path, 'hasNM'))
  })
  t.test('has package.json', async t => {
    const c = new Config({
      cwd: `${path}/hasPJ/x/y/z`,
      shorthands,
      definitions,
      npmPath: path,
    })
    await c.load()
    t.equal(c.localPrefix, resolve(path, 'hasPJ'))
  })
  t.test('nada, just use cwd', async t => {
    const c = new Config({
      cwd: '/this/path/does/not/exist/x/y/z',
      shorthands,
      definitions,
      npmPath: path,
    })
    await c.load()
    t.equal(c.localPrefix, '/this/path/does/not/exist/x/y/z')
  })
  t.end()
})

t.test('setting basic auth creds and email', async t => {
  const registry = 'https://registry.npmjs.org/'
  const path = t.testdir()
  const _auth = Buffer.from('admin:admin').toString('base64')
  const opts = {
    shorthands: {},
    argv: ['node', __filename, `--userconfig=${path}/.npmrc`],
    definitions: {
      registry: { default: registry },
    },
    npmPath: process.cwd(),
  }
  const c = new Config(opts)
  await c.load()
  c.set('email', 'name@example.com', 'user')
  t.equal(c.get('email', 'user'), 'name@example.com', 'email was set')
  await c.save('user')
  t.equal(c.get('email', 'user'), 'name@example.com', 'email still top level')
  t.strictSame(c.getCredentialsByURI(registry), { email: 'name@example.com' })
  const d = new Config(opts)
  await d.load()
  t.strictSame(d.getCredentialsByURI(registry), { email: 'name@example.com' })
  d.set('_auth', _auth, 'user')
  t.equal(d.get('_auth', 'user'), _auth, '_auth was set')
  await d.save('user')
  t.equal(d.get('_auth', 'user'), undefined, 'un-nerfed _auth deleted')
  t.strictSame(d.getCredentialsByURI(registry), {
    email: 'name@example.com',
    username: 'admin',
    password: 'admin',
    auth: _auth,
  }, 'credentials saved and nerfed')
})

t.test('setting username/password/email individually', async t => {
  const registry = 'https://registry.npmjs.org/'
  const path = t.testdir()
  const opts = {
    shorthands: {},
    argv: ['node', __filename, `--userconfig=${path}/.npmrc`],
    definitions: {
      registry: { default: registry },
    },
    npmPath: process.cwd(),
  }
  const c = new Config(opts)
  await c.load()
  c.set('email', 'name@example.com', 'user')
  t.equal(c.get('email'), 'name@example.com')
  c.set('username', 'admin', 'user')
  t.equal(c.get('username'), 'admin')
  c.set('_password', Buffer.from('admin').toString('base64'), 'user')
  t.equal(c.get('_password'), Buffer.from('admin').toString('base64'))
  t.equal(c.get('_auth'), undefined)
  await c.save('user')
  t.equal(c.get('email'), 'name@example.com')
  t.equal(c.get('username'), undefined)
  t.equal(c.get('_password'), undefined)
  t.equal(c.get('_auth'), undefined)
  t.strictSame(c.getCredentialsByURI(registry), {
    email: 'name@example.com',
    username: 'admin',
    password: 'admin',
    auth: Buffer.from('admin:admin').toString('base64'),
  })
  const d = new Config(opts)
  await d.load()
  t.equal(d.get('email'), 'name@example.com')
  t.equal(d.get('username'), undefined)
  t.equal(d.get('_password'), undefined)
  t.equal(d.get('_auth'), undefined)
  t.strictSame(d.getCredentialsByURI(registry), {
    email: 'name@example.com',
    username: 'admin',
    password: 'admin',
    auth: Buffer.from('admin:admin').toString('base64'),
  })
})

t.test('nerfdart auths set at the top level into the registry', async t => {
  const registry = 'https://registry.npmjs.org/'
  const _auth = Buffer.from('admin:admin').toString('base64')
  const username = 'admin'
  const _password = Buffer.from('admin').toString('base64')
  const email = 'i@izs.me'
  const _authToken = 'deadbeefblahblah'

  // name: [ini, expect]
  const cases = {
    '_auth only, no email': [`_auth=${_auth}`, {
      '//registry.npmjs.org/:username': username,
      '//registry.npmjs.org/:_password': _password,
    }],
    '_auth with email': [`_auth=${_auth}\nemail=${email}`, {
      '//registry.npmjs.org/:username': username,
      '//registry.npmjs.org/:_password': _password,
      email,
    }],
    '_authToken alone': [`_authToken=${_authToken}`, {
      '//registry.npmjs.org/:_authToken': _authToken,
    }],
    '_authToken and email': [`_authToken=${_authToken}\nemail=${email}`, {
      '//registry.npmjs.org/:_authToken': _authToken,
      email,
    }],
    'username and _password': [`username=${username}\n_password=${_password}`, {
      '//registry.npmjs.org/:username': username,
      '//registry.npmjs.org/:_password': _password,
    }],
    'username, password, email': [`username=${username}\n_password=${_password}\nemail=${email}`, {
      '//registry.npmjs.org/:username': username,
      '//registry.npmjs.org/:_password': _password,
      email,
    }],
    // handled invalid/legacy cases
    'username, no _password': [`username=${username}`, {}],
    '_password, no username': [`_password=${_password}`, {}],
    // de-nerfdart the email, if present in that way
    'nerf-darted email': [`//registry.npmjs.org/:email=${email}`, {
      email,
    }],
  }

  const cwd = process.cwd()
  for (const [name, [ini, expect]] of Object.entries(cases)) {
    t.test(name, async t => {
      t.teardown(() => process.chdir(cwd))
      const path = t.testdir({
        '.npmrc': ini,
        'package.json': JSON.stringify({}),
      })
      process.chdir(path)
      const argv = [
        'node',
        __filename,
        `--prefix=${path}`,
        `--userconfig=${path}/.npmrc`,
        `--globalconfig=${path}/etc/npmrc`,
      ]
      const opts = {
        shorthands: {},
        argv,
        env: {},
        definitions: {
          registry: { default: registry },
        },
        npmPath: process.cwd(),
      }
      const c = new Config(opts)
      await c.load()
      t.same(c.list[3], expect)
    })
  }
})

t.test('workspace-root settings', async t => {
  const registry = 'https://registry.npmjs.org/'
  const fixtureDef = {
    '.npmrc': 'userconfigfile = true',
    project: {
      'package.json': JSON.stringify({ workspaces: ['foo', 'bar'] }),
      '.npmrc': 'foo = bar',
      foo: {
        'package.json': JSON.stringify({ name: 'foo', version: '1.2.3' }),
        '.npmrc': 'workspace-root = ..',
        x: { y: { z: {}}},
      },
      // no ws config in bar
      bar: {
        'package.json': JSON.stringify({ name: 'bar', version: '1.2.3' }),
        x: { y: { z: {}}},
      },
    },
  }

  const opts = path => ({
    shorthands: {},
    argv: [],
    env: {
      HOME: path,
    },
    definitions: {
      registry: { default: registry },
      'workspace-root': {
        default: undefined,
        type: require('path'),
      },
      workspace: {
        default: [],
        type: [Array, String],
      },
    },
    npmPath: process.cwd(),
  })

  t.test('works in the root of the workspace', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      cwd: resolve(path, 'project/foo'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), ['foo'])
    t.strictSame(c.get('workspace-root'), resolve(path, 'project'))
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project'))
    t.equal(c.cwd, resolve(path, 'project/foo'))
  })

  t.test('works in workspace subpath', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      cwd: resolve(path, 'project/foo/x/y/z'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), ['foo'])
    t.strictSame(c.get('workspace-root'), resolve(path, 'project'))
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project'))
    t.equal(c.cwd, resolve(path, 'project/foo/x/y/z'))
  })

  t.test('does not work without ws config file', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      cwd: resolve(path, 'project/bar'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), [])
    t.strictSame(c.get('workspace-root'), undefined)
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project/bar'))
    t.equal(c.cwd, resolve(path, 'project/bar'))
  })

  t.test('set wsconfig explicitly', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      cwd: resolve(path, 'project/bar'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), [])
    t.strictSame(c.get('workspace-root'), undefined)
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project/bar'))
    t.equal(c.cwd, resolve(path, 'project/bar'))
    c.set('workspace-root', resolve(path, 'project'), 'project')
    await c.save('project')
    const file = resolve(path, 'project/bar/.npmrc')
    t.equal(fs.readFileSync(file, 'utf8'), `workspace-root=..\n`)
  })

  t.test('refuse to save empty wsconfig', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      cwd: resolve(path, 'project/bar'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), [])
    t.strictSame(c.get('workspace-root'), undefined)
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project/bar'))
    t.equal(c.cwd, resolve(path, 'project/bar'))
    c.set('workspace-root', resolve(path, 'project/bar'), 'project')
    await c.save('project')
    t.throws(() => fs.statSync(resolve(path, 'project/bar/.npmrc')), {
      code: 'ENOENT',
    })
  })

  t.test('saving wsroot config removes other project stuff', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      cwd: resolve(path, 'project/bar'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), [])
    t.strictSame(c.get('workspace-root'), undefined)
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project/bar'))
    t.equal(c.cwd, resolve(path, 'project/bar'))
    c.set('workspace-root', resolve(path, 'project'), 'project')
    c.set('other', 'thing', 'project')
    t.throws(() => c.set('workspace-root', resolve(path, 'project'), 'global'))
    t.throws(() => c.set('workspace-root', resolve(path, 'project'), 'user'))
    await t.rejects(c.save('project'), {
      message: 'Cannot set other configs with workspace-root',
    })
    c.delete('other', 'project')
    await c.save('project')
    t.equal(fs.readFileSync(resolve(path, 'project/bar/.npmrc'), 'utf8'),
      `workspace-root=..\n`)
  })

  t.test('set wsroot with explicit cli config', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      argv: [process.execPath, __filename, `--workspace-root=${path}/project`],
      cwd: resolve(path, 'project/bar'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), ['bar'])
    t.strictSame(c.get('workspace-root'), resolve(path, 'project'))
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project'))
    t.equal(c.cwd, resolve(path, 'project/bar'))
  })

  t.test('set wsroot to current project with explicit cli config', async t => {
    const path = t.testdir(fixtureDef)
    const c = new Config({
      ...opts(path),
      argv: [process.execPath, __filename, `--workspace-root=${path}/project/bar`],
      cwd: resolve(path, 'project/bar'),
    })
    await c.load()
    t.strictSame(c.get('workspace'), [])
    t.strictSame(c.get('workspace-root'), resolve(path, 'project/bar'))
    t.equal(c.get('userconfigfile'), true)
    t.equal(c.localPrefix, resolve(path, 'project/bar'))
    t.equal(c.cwd, resolve(path, 'project/bar'))
  })

  t.test('warn if wsroot set along with other configs', async t => {
    const path = t.testdir({
      ...fixtureDef,
      project: {
        ...fixtureDef.project,
        foo: {
          ...fixtureDef.project.foo,
          '.npmrc': 'workspace-root = ..\nfoo-ws-conf = true\n',
        },
      },
    })
    const logs = []
    const log = {
      warn: (...msg) => logs.push(['warn', ...msg]),
      verbose: (...msg) => logs.push(['verbose', ...msg]),
    }
    const c = new Config({
      ...opts(path),
      log,
      cwd: resolve(path, 'project/foo'),
    })
    await c.load()
    t.strictSame(logs, [
      [
        'warn',
        'config',
        'workspace-root set, ignoring other workspace-level configs',
        [
          'foo-ws-conf',
        ],
      ],
    ])
  })
})
