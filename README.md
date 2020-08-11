# `@npmcli/config`

Configuration management for the npm cli.

This module is the spiritual decendant of
[`npmconf`](http://npm.im/npmconf), and the code that once lived in npm's
`lib/config/` folder.

It does the management of configuration files that npm uses, but
importantly, does _not_ define all the configuration defaults or types, as
those parts make more sense to live within npm itself.

The only exceptions:

- The `prefix` config value has some special semantics, setting the local
  prefix if specified on the CLI options and not in global mode, or the
  global prefix otherwise.
- The `project` config file is loaded based on the local prefix (which can
  only be set by the CLI config options, and otherwise defaults to a walk
  up the folder tree to the first parent containing a `node_modules`
  folder, `package.json` file, or `package-lock.json` file.)
- The `userconfig` value, as set by the environment and CLI (defaulting to
  `~/.npmrc`, is used to load user configs.
- The `globalconfig` value, as set by the environment, CLI, and
  `userconfig` file (defaulting to `$PREFIX/etc/npmrc`) is used to load
  global configs.
- A `builtin` config, read from a `npmrc` file in the root of the npm
  project itself, overrides all defaults.

The resulting heirarchy of configs:

- CLI switches.  eg `--some-key=some-value` on the command line.
- Environment variables.  eg `npm_config_some_key=some_value` in the
  environment.
- INI-formatted project configs.  eg `some-key = some-value` in `./.npmrc`
- INI-formatted userconfig file.  eg `some-key = some-value` in `~/.npmrc`
- INI-formatted globalconfig file.  eg `some-key = some-value` in
  `/usr/local/etc/npmrc`
- INI-formatted builtin config file.  eg `some-key = some-value` in
  `/usr/local/lib/node_modules/npm/npmrc`.
- Default values (passed in by npm when it loads this module).

## USAGE

```js
const Config = require('@npmcli/config')
const types = require('./config/types.js')
const defaults = require('./config/defaults.js')

const conf = new Config({
  npmPath: resolve(__dirname, '..'),
  types,
  defaults,
  // optional, defaults to process.argv
  argv: process.argv,
  // optional, defaults to process.env
  env: process.env,
})

conf.load().then(() => {
  console.log('loaded ok! some-key = ' + conf.get('some-key'))
}).catch(er => {
  console.error('error loading configs!', er)
})
```
