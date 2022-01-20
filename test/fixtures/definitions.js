const url = require('url')
const path = require('path')
const { join } = path
const querystring = require('querystring')
const semver = require('semver')
const Umask = require('../../lib/type-defs.js').Umask.type

// dumped out of npm/cli/lib/utils/config/definitions.js

// used by cafile flattening to flatOptions.ca
const fs = require('fs')
const maybeReadFile = file => {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch (er) {
    if (er.code !== 'ENOENT')
      throw er
    return null
  }
}

const definitions = module.exports = {
  methane: {
    envExport: false,
    type: String,
    typeDescription: 'Greenhouse Gas',
    default: 'CH4',
    description: `
      This is bad for the environment, for our children, do not put it there.
    `,
  },
  'multiple-numbers': {
    key: 'multiple-numbers',
    default: [],
    type: [
      Array,
      Number,
    ],
    descriptions: 'one or more numbers',
  },
  _auth: {
    key: '_auth',
    default: null,
    type: [
      null,
      String,
    ],
    description: '\n    A basic-auth string to use when authenticating against the npm registry.\n\n    Warning: This should generally not be set via a command-line option.  It\n    is safer to use a registry-provided authentication bearer token stored in\n    the ~/.npmrc file by running `npm login`.\n  ',
    defaultDescription: 'null',
    typeDescription: 'null or String',
  },
  access: {
    key: 'access',
    default: null,
    defaultDescription: "\n    'restricted' for scoped packages, 'public' for unscoped packages\n  ",
    type: [
      null,
      'restricted',
      'public',
    ],
    description: '\n    When publishing scoped packages, the access level defaults to\n    `restricted`.  If you want your scoped package to be publicly viewable\n    (and installable) set `--access=public`. The only valid values for\n    `access` are `public` and `restricted`. Unscoped packages _always_\n    have an access level of `public`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'null, "restricted", or "public"',
  },
  all: {
    key: 'all',
    default: false,
    type: Boolean,
    short: 'a',
    description: '\n    When running `npm outdated` and `npm ls`, setting `--all` will show\n    all outdated or installed packages, rather than only those directly\n    depended upon by the current project.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'allow-same-version': {
    key: 'allow-same-version',
    default: false,
    type: Boolean,
    description: '\n    Prevents throwing an error when `npm version` is used to set the new\n    version to the same value as the current version.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  also: {
    key: 'also',
    default: null,
    type: [
      null,
      'dev',
      'development',
    ],
    description: '\n    When set to `dev` or `development`, this is an alias for\n    `--include=dev`.\n  ',
    deprecated: 'Please use --include=dev instead.',
    flatten (key, obj, flatOptions) {
      if (!/^dev(elopment)?$/.test(obj.also))
        return

      // add to include, and call the omit flattener
      obj.include = obj.include || []
      obj.include.push('dev')
      definitions.omit.flatten('omit', obj, flatOptions)
    },
    defaultDescription: 'null',
    typeDescription: 'null, "dev", or "development"',
  },
  'always-auth': {
    key: 'always-auth',
    default: false,
    type: Boolean,
    description: '\n    Force npm to always require authentication when accessing the registry,\n    even for `GET` requests.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  audit: {
    key: 'audit',
    default: true,
    type: Boolean,
    description: '\n    When "true" submit audit reports alongside `npm install` runs to the\n    default registry and all registries configured for scopes.  See the\n    documentation for [`npm audit`](/commands/npm-audit) for details on\n    what is submitted.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  'audit-level': {
    key: 'audit-level',
    default: null,
    type: [
      'low',
      'moderate',
      'high',
      'critical',
      'none',
      null,
    ],
    description: '\n    The minimum level of vulnerability for `npm audit` to exit with\n    a non-zero exit code.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: '"low", "moderate", "high", "critical", "none", or null',
  },
  'auth-type': {
    key: 'auth-type',
    default: 'legacy',
    type: [
      'legacy',
      'sso',
      'saml',
      'oauth',
    ],
    deprecated: '\n    This method of SSO/SAML/OAuth is deprecated and will be removed in\n    a future version of npm in favor of web-based login.\n  ',
    description: '\n    What authentication strategy to use with `adduser`/`login`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"legacy"',
    typeDescription: '"legacy", "sso", "saml", or "oauth"',
  },
  before: {
    key: 'before',
    default: null,
    type: [
      null,
      Date,
    ],
    description: "\n    If passed to `npm install`, will rebuild the npm tree such that only\n    versions that were available **on or before** the `--before` time get\n    installed.  If there's no versions available for the current set of\n    direct dependencies, the command will error.\n\n    If the requested version is a `dist-tag` and the given tag does not\n    pass the `--before` filter, the most recent version less than or equal\n    to that tag will be used. For example, `foo@latest` might install\n    `foo@1.2` even though `latest` is `2.0`.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or Date',
  },
  'bin-links': {
    key: 'bin-links',
    default: true,
    type: Boolean,
    description: "\n    Tells npm to create symlinks (or `.cmd` shims on Windows) for package\n    executables.\n\n    Set to false to have it not do this.  This can be used to work around the\n    fact that some file systems don't support symlinks, even on ostensibly\n    Unix systems.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  browser: {
    key: 'browser',
    default: null,
    defaultDescription: '\n    OS X: `"open"`, Windows: `"start"`, Others: `"xdg-open"`\n  ',
    type: [
      null,
      Boolean,
      String,
    ],
    description: '\n    The browser that is called by npm commands to open websites.\n\n    Set to `false` to suppress browser behavior and instead print urls to\n    terminal.\n\n    Set to `true` to use default system URL opener.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'null, Boolean, or String',
  },
  ca: {
    key: 'ca',
    default: null,
    type: [
      null,
      String,
      Array,
    ],
    description: '\n    The Certificate Authority signing certificate that is trusted for SSL\n    connections to the registry. Values should be in PEM format (Windows\n    calls it "Base-64 encoded X.509 (.CER)") with newlines replaced by the\n    string "\\n". For example:\n\n    ```ini\n    ca="-----BEGIN CERTIFICATE-----\\nXXXX\\nXXXX\\n-----END CERTIFICATE-----"\n    ```\n\n    Set to `null` to only allow "known" registrars, or to a specific CA\n    cert to trust only that specific signing authority.\n\n    Multiple CAs can be trusted by specifying an array of certificates:\n\n    ```ini\n    ca[]="..."\n    ca[]="..."\n    ```\n\n    See also the `strict-ssl` config.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or String (can be set multiple times)',
  },
  cache: {
    key: 'cache',
    default: '~/.npm',
    defaultDescription: '\n    Windows: `%LocalAppData%\\npm-cache`, Posix: `~/.npm`\n  ',
    type: path,
    description: "\n    The location of npm's cache directory.  See [`npm\n    cache`](/commands/npm-cache)\n  ",
    flatten (key, obj, flatOptions) {
      flatOptions.cache = join(obj.cache, '_cacache')
    },
    typeDescription: 'Path',
  },
  'cache-max': {
    key: 'cache-max',
    default: null,
    type: Number,
    description: '\n    `--cache-max=0` is an alias for `--prefer-online`\n  ',
    deprecated: '\n    This option has been deprecated in favor of `--prefer-online`\n  ',
    flatten (key, obj, flatOptions) {
      if (obj[key] <= 0)
        flatOptions.preferOnline = true
    },
    defaultDescription: 'Infinity',
    typeDescription: 'Number',
  },
  'cache-min': {
    key: 'cache-min',
    default: 0,
    type: Number,
    description: '\n    `--cache-min=9999 (or bigger)` is an alias for `--prefer-offline`.\n  ',
    deprecated: '\n    This option has been deprecated in favor of `--prefer-offline`.\n  ',
    flatten (key, obj, flatOptions) {
      if (obj[key] >= 9999)
        flatOptions.preferOffline = true
    },
    defaultDescription: '0',
    typeDescription: 'Number',
  },
  cafile: {
    key: 'cafile',
    default: null,
    type: path,
    description: "\n    A path to a file containing one or multiple Certificate Authority signing\n    certificates. Similar to the `ca` setting, but allows for multiple\n    CA's, as well as for the CA information to be stored in a file on disk.\n  ",
    flatten (key, obj, flatOptions) {
    // always set to null in defaults
      if (!obj.cafile)
        return

      const raw = maybeReadFile(obj.cafile)
      if (!raw)
        return

      const delim = '-----END CERTIFICATE-----'
      flatOptions.ca = raw.replace(/\r\n/g, '\n').split(delim)
        .filter(section => section.trim())
        .map(section => section.trimLeft() + delim)
    },
    defaultDescription: 'null',
    typeDescription: 'Path',
  },
  call: {
    key: 'call',
    default: '',
    type: String,
    short: 'c',
    description: '\n    Optional companion option for `npm exec`, `npx` that allows for\n    specifying a custom command to be run along with the installed packages.\n\n    ```bash\n    npm exec --package yo --package generator-node --call "yo node"\n    ```\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '""',
    typeDescription: 'String',
  },
  cert: {
    key: 'cert',
    default: null,
    type: [
      null,
      String,
    ],
    description: '\n    A client certificate to pass when accessing the registry.  Values should\n    be in PEM format (Windows calls it "Base-64 encoded X.509 (.CER)") with\n    newlines replaced by the string "\\n". For example:\n\n    ```ini\n    cert="-----BEGIN CERTIFICATE-----\\nXXXX\\nXXXX\\n-----END CERTIFICATE-----"\n    ```\n\n    It is _not_ the path to a certificate file (and there is no "certfile"\n    option).\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or String',
  },
  'ci-name': {
    key: 'ci-name',
    default: null,
    defaultDescription: '\n    The name of the current CI system, or `null` when not on a known CI\n    platform.\n  ',
    type: [
      null,
      String,
    ],
    description: '\n    The name of a continuous integration system.  If not set explicitly, npm\n    will detect the current CI environment using the\n    [`@npmcli/ci-detect`](http://npm.im/@npmcli/ci-detect) module.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'null or String',
  },
  cidr: {
    key: 'cidr',
    default: null,
    type: [
      null,
      String,
      Array,
    ],
    description: '\n    This is a list of CIDR address to be used when configuring limited access\n    tokens with the `npm token create` command.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or String (can be set multiple times)',
  },
  color: {
    key: 'color',
    default: true,
    defaultDescription: "\n    true unless the NO_COLOR environ is set to something other than '0'\n  ",
    type: [
      'always',
      Boolean,
    ],
    description: '\n    If false, never shows colors.  If `"always"` then always shows colors.\n    If true, then only prints color codes for tty file descriptors.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.color = !obj.color ? false
        : obj.color === 'always' ? true
        : process.stdout.isTTY
    },
    typeDescription: '"always" or Boolean',
  },
  'commit-hooks': {
    key: 'commit-hooks',
    default: true,
    type: Boolean,
    description: '\n    Run git commit hooks when using the `npm version` command.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  depth: {
    key: 'depth',
    default: null,
    defaultDescription: '\n    `Infinity` if `--all` is set, otherwise `1`\n  ',
    type: [
      null,
      Number,
    ],
    description: '\n    The depth to go when recursing packages for `npm ls`.\n\n    If not set, `npm ls` will show only the immediate dependencies of the\n    root project.  If `--all` is set, then npm will show all dependencies\n    by default.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'null or Number',
  },
  description: {
    key: 'description',
    default: true,
    type: Boolean,
    description: '\n    Show the description in `npm search`\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.search = flatOptions.search || { limit: 20 }
      flatOptions.search[key] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  diff: {
    key: 'diff',
    default: [],
    type: [
      String,
      Array,
    ],
    description: '\n    Define arguments to compare in `npm diff`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '',
    typeDescription: 'String (can be set multiple times)',
  },
  'diff-ignore-all-space': {
    key: 'diff-ignore-all-space',
    default: false,
    type: Boolean,
    description: '\n    Ignore whitespace when comparing lines in `npm diff`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'diff-name-only': {
    key: 'diff-name-only',
    default: false,
    type: Boolean,
    description: '\n    Prints only filenames when using `npm diff`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'diff-no-prefix': {
    key: 'diff-no-prefix',
    default: false,
    type: Boolean,
    description: '\n    Do not show any source or destination prefix in `npm diff` output.\n\n    Note: this causes `npm diff` to ignore the `--diff-src-prefix` and\n    `--diff-dst-prefix` configs.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'diff-dst-prefix': {
    key: 'diff-dst-prefix',
    default: 'b/',
    type: String,
    description: '\n    Destination prefix to be used in `npm diff` output.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"b/"',
    typeDescription: 'String',
  },
  'diff-src-prefix': {
    key: 'diff-src-prefix',
    default: 'a/',
    type: String,
    description: '\n    Source prefix to be used in `npm diff` output.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"a/"',
    typeDescription: 'String',
  },
  'diff-text': {
    key: 'diff-text',
    default: false,
    type: Boolean,
    description: '\n    Treat all files as text in `npm diff`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'diff-unified': {
    key: 'diff-unified',
    default: 3,
    type: Number,
    description: '\n    The number of lines of context to print in `npm diff`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '3',
    typeDescription: 'Number',
  },
  'dry-run': {
    key: 'dry-run',
    default: false,
    type: Boolean,
    description: "\n    Indicates that you don't want npm to make any changes and that it should\n    only report what it would have done.  This can be passed into any of the\n    commands that modify your local installation, eg, `install`,\n    `update`, `dedupe`, `uninstall`, as well as `pack` and\n    `publish`.\n\n    Note: This is NOT honored by other network related commands, eg\n    `dist-tags`, `owner`, etc.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  editor: {
    key: 'editor',
    default: 'vim',
    defaultDescription: "\n    The EDITOR or VISUAL environment variables, or 'notepad.exe' on Windows,\n    or 'vim' on Unix systems\n  ",
    type: String,
    description: '\n    The command to run for `npm edit` and `npm config edit`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'String',
  },
  'engine-strict': {
    key: 'engine-strict',
    default: false,
    type: Boolean,
    description: '\n    If set to true, then npm will stubbornly refuse to install (or even\n    consider installing) any package that claims to not be compatible with\n    the current Node.js version.\n\n    This can be overridden by setting the `--force` flag.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'fetch-retries': {
    key: 'fetch-retries',
    default: 2,
    type: Number,
    description: '\n    The "retries" config for the `retry` module to use when fetching\n    packages from the registry.\n\n    npm will retry idempotent read requests to the registry in the case\n    of network failures or 5xx HTTP errors.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.retry = flatOptions.retry || {}
      flatOptions.retry.retries = obj[key]
    },
    defaultDescription: '2',
    typeDescription: 'Number',
  },
  'fetch-retry-factor': {
    key: 'fetch-retry-factor',
    default: 10,
    type: Number,
    description: '\n    The "factor" config for the `retry` module to use when fetching\n    packages.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.retry = flatOptions.retry || {}
      flatOptions.retry.factor = obj[key]
    },
    defaultDescription: '10',
    typeDescription: 'Number',
  },
  'fetch-retry-maxtimeout': {
    key: 'fetch-retry-maxtimeout',
    default: 60000,
    defaultDescription: '60000 (1 minute)',
    type: Number,
    description: '\n    The "maxTimeout" config for the `retry` module to use when fetching\n    packages.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.retry = flatOptions.retry || {}
      flatOptions.retry.maxTimeout = obj[key]
    },
    typeDescription: 'Number',
  },
  'fetch-retry-mintimeout': {
    key: 'fetch-retry-mintimeout',
    default: 10000,
    defaultDescription: '10000 (10 seconds)',
    type: Number,
    description: '\n    The "minTimeout" config for the `retry` module to use when fetching\n    packages.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.retry = flatOptions.retry || {}
      flatOptions.retry.minTimeout = obj[key]
    },
    typeDescription: 'Number',
  },
  'fetch-timeout': {
    key: 'fetch-timeout',
    default: 300000,
    defaultDescription: '300000 (5 minutes)',
    type: Number,
    description: '\n    The maximum amount of time to wait for HTTP requests to complete.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.timeout = obj[key]
    },
    typeDescription: 'Number',
  },
  force: {
    key: 'force',
    default: false,
    type: Boolean,
    short: 'f',
    description: "\n    Removes various protections against unfortunate side effects, common\n    mistakes, unnecessary performance degradation, and malicious input.\n\n    * Allow clobbering non-npm files in global installs.\n    * Allow the `npm version` command to work on an unclean git repository.\n    * Allow deleting the cache folder with `npm cache clean`.\n    * Allow installing packages that have an `engines` declaration\n      requiring a different version of npm.\n    * Allow installing packages that have an `engines` declaration\n      requiring a different version of `node`, even if `--engine-strict`\n      is enabled.\n    * Allow `npm audit fix` to install modules outside your stated\n      dependency range (including SemVer-major changes).\n    * Allow unpublishing all versions of a published package.\n    * Allow conflicting peerDependencies to be installed in the root project.\n\n    If you don't have a clear idea of what you want to do, it is strongly\n    recommended that you do not use this option!\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'foreground-scripts': {
    key: 'foreground-scripts',
    default: false,
    type: Boolean,
    description: '\n    Run all build scripts (ie, `preinstall`, `install`, and\n    `postinstall`) scripts for installed packages in the foreground\n    process, sharing standard input, output, and error with the main npm\n    process.\n\n    Note that this will generally make installs run slower, and be much\n    noisier, but can be useful for debugging.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'format-package-lock': {
    key: 'format-package-lock',
    default: true,
    type: Boolean,
    description: '\n    Format `package-lock.json` or `npm-shrinkwrap.json` as a human\n    readable file.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  fund: {
    key: 'fund',
    default: true,
    type: Boolean,
    description: '\n    When "true" displays the message at the end of each `npm install`\n    acknowledging the number of dependencies looking for funding.\n    See [`npm fund`](/commands/npm-fund) for details.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  git: {
    key: 'git',
    default: 'git',
    type: String,
    description: '\n    The command to use for git commands.  If git is installed on the\n    computer, but is not in the `PATH`, then set this to the full path to\n    the git binary.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"git"',
    typeDescription: 'String',
  },
  'git-tag-version': {
    key: 'git-tag-version',
    default: true,
    type: Boolean,
    description: '\n    Tag the commit when using the `npm version` command.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  global: {
    key: 'global',
    default: false,
    type: Boolean,
    short: 'g',
    description: '\n    Operates in "global" mode, so that packages are installed into the\n    `prefix` folder instead of the current working directory.  See\n    [folders](/configuring-npm/folders) for more on the differences in\n    behavior.\n\n    * packages are installed into the `{prefix}/lib/node_modules` folder,\n      instead of the current working directory.\n    * bin files are linked to `{prefix}/bin`\n    * man pages are linked to `{prefix}/share/man`\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'global-style': {
    key: 'global-style',
    default: false,
    type: Boolean,
    description: '\n    Causes npm to install the package into your local `node_modules` folder\n    with the same layout it uses with the global `node_modules` folder.\n    Only your direct dependencies will show in `node_modules` and\n    everything they depend on will be flattened in their `node_modules`\n    folders.  This obviously will eliminate some deduping. If used with\n    `legacy-bundling`, `legacy-bundling` will be preferred.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  globalconfig: {
    key: 'globalconfig',
    type: path,
    default: '',
    defaultDescription: "\n    The global --prefix setting plus 'etc/npmrc'. For example,\n    '/usr/local/etc/npmrc'\n  ",
    description: '\n    The config file to read for global config options.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'Path',
  },
  heading: {
    key: 'heading',
    default: 'npm',
    type: String,
    description: '\n    The string that starts all the debugging log output.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"npm"',
    typeDescription: 'String',
  },
  'https-proxy': {
    key: 'https-proxy',
    default: null,
    type: [
      null,
      url,
    ],
    description: '\n    A proxy to use for outgoing https requests. If the `HTTPS_PROXY` or\n    `https_proxy` or `HTTP_PROXY` or `http_proxy` environment variables\n    are set, proxy settings will be honored by the underlying\n    `make-fetch-happen` library.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or URL',
  },
  'if-present': {
    key: 'if-present',
    default: false,
    type: Boolean,
    description: "\n    If true, npm will not exit with an error code when `run-script` is\n    invoked for a script that isn't defined in the `scripts` section of\n    `package.json`. This option can be used when it's desirable to\n    optionally run a script when it's present and fail if the script fails.\n    This is useful, for example, when running scripts that may only apply for\n    some builds in an otherwise generic CI setup.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'ignore-scripts': {
    key: 'ignore-scripts',
    default: false,
    type: Boolean,
    description: '\n    If true, npm does not run scripts specified in package.json files.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  include: {
    key: 'include',
    default: [],
    type: [
      Array,
      'prod',
      'dev',
      'optional',
      'peer',
    ],
    description: '\n    Option that allows for defining which types of dependencies to install.\n\n    This is the inverse of `--omit=<type>`.\n\n    Dependency types specified in `--include` will not be omitted,\n    regardless of the order in which omit/include are specified on the\n    command-line.\n  ',
    flatten (key, obj, flatOptions) {
    // just call the omit flattener, it reads from obj.include
      definitions.omit.flatten('omit', obj, flatOptions)
    },
    defaultDescription: '',
    typeDescription: '"prod", "dev", "optional", or "peer" (can be set multiple times)',
  },
  'include-staged': {
    key: 'include-staged',
    default: false,
    type: Boolean,
    description: '\n    Allow installing "staged" published packages, as defined by [npm RFC PR\n    #92](https://github.com/npm/rfcs/pull/92).\n\n    This is experimental, and not implemented by the npm public registry.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'init-author-email': {
    key: 'init-author-email',
    default: '',
    type: String,
    description: "\n    The value `npm init` should use by default for the package author's\n    email.\n  ",
    defaultDescription: '""',
    typeDescription: 'String',
  },
  'init-author-name': {
    key: 'init-author-name',
    default: '',
    type: String,
    description: "\n    The value `npm init` should use by default for the package author's name.\n  ",
    defaultDescription: '""',
    typeDescription: 'String',
  },
  'init-author-url': {
    key: 'init-author-url',
    default: '',
    type: [
      '',
      url,
    ],
    description: "\n    The value `npm init` should use by default for the package author's homepage.\n  ",
    defaultDescription: '""',
    typeDescription: '"" or URL',
  },
  'init-license': {
    key: 'init-license',
    default: 'ISC',
    type: String,
    description: '\n    The value `npm init` should use by default for the package license.\n  ',
    defaultDescription: '"ISC"',
    typeDescription: 'String',
  },
  'init-module': {
    key: 'init-module',
    default: '~/.npm-init.js',
    type: path,
    description: '\n    A module that will be loaded by the `npm init` command.  See the\n    documentation for the\n    [init-package-json](https://github.com/npm/init-package-json) module for\n    more information, or [npm init](/commands/npm-init).\n  ',
    defaultDescription: '"~/.npm-init.js"',
    typeDescription: 'Path',
  },
  'init-version': {
    key: 'init-version',
    default: '1.0.0',
    type: semver,
    description: '\n    The value that `npm init` should use by default for the package\n    version number, if not already set in package.json.\n  ',
    defaultDescription: '"1.0.0"',
    typeDescription: 'SemVer string',
  },
  'init.author.email': {
    key: 'init.author.email',
    default: '',
    type: String,
    deprecated: '\n    Use `--init-author-email` instead.',
    description: '\n    Alias for `--init-author-email`\n  ',
    defaultDescription: '""',
    typeDescription: 'String',
  },
  'init.author.name': {
    key: 'init.author.name',
    default: '',
    type: String,
    deprecated: '\n    Use `--init-author-name` instead.\n  ',
    description: '\n    Alias for `--init-author-name`\n  ',
    defaultDescription: '""',
    typeDescription: 'String',
  },
  'init.author.url': {
    key: 'init.author.url',
    default: '',
    type: [
      '',
      url,
    ],
    deprecated: '\n    Use `--init-author-url` instead.\n  ',
    description: '\n    Alias for `--init-author-url`\n  ',
    defaultDescription: '""',
    typeDescription: '"" or URL',
  },
  'init.license': {
    key: 'init.license',
    default: 'ISC',
    type: String,
    deprecated: '\n    Use `--init-license` instead.\n  ',
    description: '\n    Alias for `--init-license`\n  ',
    defaultDescription: '"ISC"',
    typeDescription: 'String',
  },
  'init.module': {
    key: 'init.module',
    default: '~/.npm-init.js',
    type: path,
    deprecated: '\n    Use `--init-module` instead.\n  ',
    description: '\n    Alias for `--init-module`\n  ',
    defaultDescription: '"~/.npm-init.js"',
    typeDescription: 'Path',
  },
  'init.version': {
    key: 'init.version',
    default: '1.0.0',
    type: semver,
    deprecated: '\n    Use `--init-version` instead.\n  ',
    description: '\n    Alias for `--init-version`\n  ',
    defaultDescription: '"1.0.0"',
    typeDescription: 'SemVer string',
  },
  json: {
    key: 'json',
    default: false,
    type: Boolean,
    description: '\n    Whether or not to output JSON data, rather than the normal output.\n\n    This feature is currently experimental, and the output data structures\n    for many commands is either not implemented in JSON yet, or subject to\n    change.  Only the output from `npm ls --json` and `npm search --json`\n    are currently valid.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  key: {
    key: 'key',
    default: null,
    type: [
      null,
      String,
    ],
    description: '\n    A client key to pass when accessing the registry.  Values should be in\n    PEM format with newlines replaced by the string "\\n". For example:\n\n    ```ini\n    key="-----BEGIN PRIVATE KEY-----\\nXXXX\\nXXXX\\n-----END PRIVATE KEY-----"\n    ```\n\n    It is _not_ the path to a key file (and there is no "keyfile" option).\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or String',
  },
  'legacy-bundling': {
    key: 'legacy-bundling',
    default: false,
    type: Boolean,
    description: '\n    Causes npm to install the package such that versions of npm prior to 1.4,\n    such as the one included with node 0.8, can install the package.  This\n    eliminates all automatic deduping. If used with `global-style` this\n    option will be preferred.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'legacy-peer-deps': {
    key: 'legacy-peer-deps',
    default: false,
    type: Boolean,
    description: '\n    Causes npm to completely ignore `peerDependencies` when building a\n    package tree, as in npm versions 3 through 6.\n\n    If a package cannot be installed because of overly strict\n    `peerDependencies` that collide, it provides a way to move forward\n    resolving the situation.\n\n    This differs from `--omit=peer`, in that `--omit=peer` will avoid\n    unpacking `peerDependencies` on disk, but will still design a tree such\n    that `peerDependencies` _could_ be unpacked in a correct place.\n\n    Use of `legacy-peer-deps` is not recommended, as it will not enforce\n    the `peerDependencies` contract that meta-dependencies may rely on.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  link: {
    key: 'link',
    default: false,
    type: Boolean,
    description: '\n    If true, then local installs will link if there is a suitable globally\n    installed package.\n\n    Note that this means that local installs can cause things to be installed\n    into the global space at the same time.  The link is only done if one of\n    the two conditions are met:\n\n    * The package is not already installed globally, or\n    * the globally installed version is identical to the version that is\n      being installed locally.\n  ',
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'local-address': {
    key: 'local-address',
    default: null,
    type: [
      null,
      '127.0.0.1',
      '::1',
      'fe80::1',
      'fe80::aede:48ff:fe00:1122',
      'fe80::18fe:6168:6908:4239',
      '2600:1700:87d0:b28f:481:1fd0:2067:5a90',
      '2600:1700:87d0:b28f:11be:d3f3:278c:ade9',
      'fd2e:635c:9594:10:109e:699c:6fdc:41b9',
      'fd2e:635c:9594:10:69ce:d360:4ab9:1632',
      '192.168.103.122',
      'fe80::715:4a5e:3af5:99e5',
      'fe80::d32a:27b1:2ac:1155',
      'fe80::bbb2:6e76:3877:9f2f',
      'fe80::8e1f:15b0:b70:2d70',
    ],
    typeDescription: 'IP Address',
    description: '\n    The IP address of the local interface to use when making connections to\n    the npm registry.  Must be IPv4 in versions of Node prior to 0.12.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
  },
  location: {
    key: 'location',
    default: 'user',
    type: ['global', 'user', 'project'],
    description: '\n    When passed to \`npm config\` this refers to which config file to use.',
    defaultDescription: '\n    "user" unless \`--global\` is passed, which will also set this value to "global"',
    typeDescription: '"global", "user", or "project"',
  },
  loglevel: {
    key: 'loglevel',
    default: 'notice',
    type: [
      'silent',
      'error',
      'warn',
      'notice',
      'http',
      'timing',
      'info',
      'verbose',
      'silly',
    ],
    description: '\n    What level of logs to report.  On failure, *all* logs are written to\n    `npm-debug.log` in the current working directory.\n\n    Any logs of a higher level than the setting are shown. The default is\n    "notice".\n  ',
    defaultDescription: '"notice"',
    typeDescription: '"silent", "error", "warn", "notice", "http", "timing", "info", "verbose", or "silly"',
  },
  'logs-max': {
    key: 'logs-max',
    default: 10,
    type: Number,
    description: '\n    The maximum number of log files to store.\n  ',
    defaultDescription: '10',
    typeDescription: 'Number',
  },
  long: {
    key: 'long',
    default: false,
    type: Boolean,
    short: 'l',
    description: '\n    Show extended information in `npm ls` and `npm search`.\n  ',
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  maxsockets: {
    key: 'maxsockets',
    default: null,
    type: Number,
    description: '\n    The maximum number of connections to use per origin (protocol/host/port\n    combination).\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.maxSockets = obj[key]
    },
    defaultDescription: 'Infinity',
    typeDescription: 'Number',
  },
  message: {
    key: 'message',
    default: '%s',
    type: String,
    short: 'm',
    description: '\n    Commit message which is used by `npm version` when creating version commit.\n\n    Any "%s" in the message will be replaced with the version number.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"%s"',
    typeDescription: 'String',
  },
  'node-options': {
    key: 'node-options',
    default: null,
    type: [
      null,
      String,
    ],
    description: '\n    Options to pass through to Node.js via the `NODE_OPTIONS` environment\n    variable.  This does not impact how npm itself is executed but it does\n    impact how lifecycle scripts are called.\n  ',
    defaultDescription: 'null',
    typeDescription: 'null or String',
  },
  'node-version': {
    key: 'node-version',
    default: 'v15.3.0',
    defaultDescription: 'Node.js `process.version` value',
    type: semver,
    description: "\n    The node version to use when checking a package's `engines` setting.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'SemVer string',
  },
  noproxy: {
    key: 'noproxy',
    default: '',
    defaultDescription: '\n    The value of the NO_PROXY environment variable\n  ',
    type: [
      String,
      Array,
    ],
    description: '\n    Domain extensions that should bypass any proxies.\n\n    Also accepts a comma-delimited string.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.noProxy = obj[key].join(',')
    },
    typeDescription: 'String (can be set multiple times)',
  },
  'npm-version': {
    key: 'npm-version',
    default: '7.6.3',
    defaultDescription: 'Output of `npm --version`',
    type: semver,
    description: "\n    The npm version to use when checking a package's `engines` setting.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'SemVer string',
  },
  offline: {
    key: 'offline',
    default: false,
    type: Boolean,
    description: '\n    Force offline mode: no network requests will be done during install. To allow\n    the CLI to fill in missing cache data, see `--prefer-offline`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  omit: {
    key: 'omit',
    default: [],
    defaultDescription: "\n    'dev' if the NODE_ENV environment variable is set to 'production',\n    otherwise empty.\n  ",
    type: [
      Array,
      'dev',
      'optional',
      'peer',
    ],
    description: "\n    Dependency types to omit from the installation tree on disk.\n\n    Note that these dependencies _are_ still resolved and added to the\n    `package-lock.json` or `npm-shrinkwrap.json` file.  They are just\n    not physically installed on disk.\n\n    If a package type appears in both the `--include` and `--omit`\n    lists, then it will be included.\n\n    If the resulting omit list includes `'dev'`, then the `NODE_ENV`\n    environment variable will be set to `'production'` for all lifecycle\n    scripts.\n  ",
    flatten (key, obj, flatOptions) {
      const include = obj.include || []
      const omit = flatOptions.omit || []
      flatOptions.omit = omit.concat(obj[key])
        .filter(type => type && !include.includes(type))
    },
    typeDescription: '"dev", "optional", or "peer" (can be set multiple times)',
  },
  only: {
    key: 'only',
    default: null,
    type: [
      null,
      'prod',
      'production',
    ],
    deprecated: '\n    Use `--omit=dev` to omit dev dependencies from the install.\n  ',
    description: '\n    When set to `prod` or `production`, this is an alias for\n    `--omit=dev`.\n  ',
    flatten (key, obj, flatOptions) {
      const value = obj[key]
      if (!/^prod(uction)?$/.test(value))
        return

      obj.omit = obj.omit || []
      obj.omit.push('dev')
      definitions.omit.flatten('omit', obj, flatOptions)
    },
    defaultDescription: 'null',
    typeDescription: 'null, "prod", or "production"',
  },
  optional: {
    key: 'optional',
    default: null,
    type: [
      null,
      Boolean,
    ],
    deprecated: '\n    Use `--omit=optional` to exclude optional dependencies, or\n    `--include=optional` to include them.\n\n    Default value does install optional deps unless otherwise omitted.\n  ',
    description: '\n    Alias for --include=optional or --omit=optional\n  ',
    flatten (key, obj, flatOptions) {
      const value = obj[key]
      if (value === null)
        return
      else if (value === true) {
        obj.include = obj.include || []
        obj.include.push('optional')
      } else {
        obj.omit = obj.omit || []
        obj.omit.push('optional')
      }
      definitions.omit.flatten('omit', obj, flatOptions)
    },
    defaultDescription: 'null',
    typeDescription: 'null or Boolean',
  },
  otp: {
    key: 'otp',
    default: null,
    type: [
      null,
      String,
    ],
    description: "\n    This is a one-time password from a two-factor authenticator.  It's needed\n    when publishing or changing package permissions with `npm access`.\n\n    If not set, and a registry response fails with a challenge for a one-time\n    password, npm will prompt on the command line for one.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null or String',
  },
  package: {
    key: 'package',
    default: [],
    type: [
      String,
      Array,
    ],
    description: '\n    The package to install for [`npm exec`](/commands/npm-exec)\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '',
    typeDescription: 'String (can be set multiple times)',
  },
  'package-lock': {
    key: 'package-lock',
    default: true,
    type: Boolean,
    description: '\n    If set to false, then ignore `package-lock.json` files when installing.\n    This will also prevent _writing_ `package-lock.json` if `save` is\n    true.\n\n    When package package-locks are disabled, automatic pruning of extraneous\n    modules will also be disabled.  To remove extraneous modules with\n    package-locks disabled use `npm prune`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  'package-lock-only': {
    key: 'package-lock-only',
    default: false,
    type: Boolean,
    description: '\n    If set to true, it will update only the `package-lock.json`, instead of\n    checking `node_modules` and downloading dependencies.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  parseable: {
    key: 'parseable',
    default: false,
    type: Boolean,
    short: 'p',
    description: '\n    Output parseable results from commands that write to standard output. For\n    `npm search`, this will be tab-separated table format.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'prefer-offline': {
    key: 'prefer-offline',
    default: false,
    type: Boolean,
    description: '\n    If true, staleness checks for cached data will be bypassed, but missing\n    data will be requested from the server. To force full offline mode, use\n    `--offline`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'prefer-online': {
    key: 'prefer-online',
    default: false,
    type: Boolean,
    description: '\n    If true, staleness checks for cached data will be forced, making the CLI\n    look for updates immediately even for fresh package data.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  prefix: {
    key: 'prefix',
    type: path,
    short: 'C',
    default: '',
    defaultDescription: '\n    In global mode, the folder where the node executable is installed. In\n    local mode, the nearest parent folder containing either a package.json\n    file or a node_modules folder.\n  ',
    description: '\n    The location to install global items.  If set on the command line, then\n    it forces non-global commands to run in the specified folder.\n  ',
    typeDescription: 'Path',
  },
  preid: {
    key: 'preid',
    default: '',
    type: String,
    description: '\n    The "prerelease identifier" to use as a prefix for the "prerelease" part\n    of a semver. Like the `rc` in `1.2.0-rc.8`.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '""',
    typeDescription: 'String',
  },
  production: {
    key: 'production',
    default: false,
    type: Boolean,
    deprecated: 'Use `--omit=dev` instead.',
    description: 'Alias for `--omit=dev`',
    flatten (key, obj, flatOptions) {
      const value = obj[key]
      if (!value)
        return

      obj.omit = obj.omit || []
      obj.omit.push('dev')
      definitions.omit.flatten('omit', obj, flatOptions)
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  progress: {
    key: 'progress',
    default: true,
    defaultDescription: '\n    `true` unless running in a known CI system\n  ',
    type: Boolean,
    description: '\n    When set to `true`, npm will display a progress bar during time\n    intensive operations, if `process.stderr` is a TTY.\n\n    Set to `false` to suppress the progress bar.\n  ',
    typeDescription: 'Boolean',
  },
  proxy: {
    key: 'proxy',
    default: null,
    type: [
      null,
      false,
      url,
    ],
    description: '\n    A proxy to use for outgoing http requests. If the `HTTP_PROXY` or\n    `http_proxy` environment variables are set, proxy settings will be\n    honored by the underlying `request` library.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'null',
    typeDescription: 'null, false, or URL',
  },
  'read-only': {
    key: 'read-only',
    default: false,
    type: Boolean,
    description: '\n    This is used to mark a token as unable to publish when configuring\n    limited access tokens with the `npm token create` command.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'rebuild-bundle': {
    key: 'rebuild-bundle',
    default: true,
    type: Boolean,
    description: '\n    Rebuild bundled dependencies after installation.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  registry: {
    key: 'registry',
    default: 'https://registry.npmjs.org/',
    type: [null, url],
    description: '\n    The base URL of the npm registry.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"https://registry.npmjs.org/"',
    typeDescription: 'URL',
  },
  save: {
    key: 'save',
    default: true,
    type: Boolean,
    short: 'S',
    description: '\n    Save installed packages to a package.json file as dependencies.\n\n    When used with the `npm rm` command, removes the dependency from\n    package.json.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  'save-bundle': {
    key: 'save-bundle',
    default: false,
    type: Boolean,
    short: 'B',
    description: '\n    If a package would be saved at install time by the use of `--save`,\n    `--save-dev`, or `--save-optional`, then also put it in the\n    `bundleDependencies` list.\n\n    Ignore if `--save-peer` is set, since peerDependencies cannot be bundled.\n  ',
    flatten (key, obj, flatOptions) {
    // XXX update arborist to just ignore it if resulting saveType is peer
    // otherwise this won't have the expected effect:
    //
    // npm config set save-peer true
    // npm i foo --save-bundle --save-prod <-- should bundle
      flatOptions.saveBundle = obj['save-bundle'] && !obj['save-peer']
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'save-dev': {
    key: 'save-dev',
    default: false,
    type: Boolean,
    short: 'D',
    description: '\n    Save installed packages to a package.json file as `devDependencies`.\n  ',
    flatten (key, obj, flatOptions) {
      if (!obj[key]) {
        if (flatOptions.saveType === 'dev')
          delete flatOptions.saveType
        return
      }

      flatOptions.saveType = 'dev'
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'save-exact': {
    key: 'save-exact',
    default: false,
    type: Boolean,
    short: 'E',
    description: "\n    Dependencies saved to package.json will be configured with an exact\n    version rather than using npm's default semver range operator.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'save-optional': {
    key: 'save-optional',
    default: false,
    type: Boolean,
    short: 'O',
    description: '\n    Save installed packages to a package.json file as\n    `optionalDependencies`.\n  ',
    flatten (key, obj, flatOptions) {
      if (!obj[key]) {
        if (flatOptions.saveType === 'optional')
          delete flatOptions.saveType
        else if (flatOptions.saveType === 'peerOptional')
          flatOptions.saveType = 'peer'
        return
      }

      if (flatOptions.saveType === 'peerOptional')
        return

      if (flatOptions.saveType === 'peer')
        flatOptions.saveType = 'peerOptional'
      else
        flatOptions.saveType = 'optional'
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'save-peer': {
    key: 'save-peer',
    default: false,
    type: Boolean,
    description: '\n    Save installed packages. to a package.json file as `peerDependencies`\n  ',
    flatten (key, obj, flatOptions) {
      if (!obj[key]) {
        if (flatOptions.saveType === 'peer')
          delete flatOptions.saveType
        else if (flatOptions.saveType === 'peerOptional')
          flatOptions.saveType = 'optional'
        return
      }

      if (flatOptions.saveType === 'peerOptional')
        return

      if (flatOptions.saveType === 'optional')
        flatOptions.saveType = 'peerOptional'
      else
        flatOptions.saveType = 'peer'
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'save-prefix': {
    key: 'save-prefix',
    default: '^',
    type: String,
    description: "\n    Configure how versions of packages installed to a package.json file via\n    `--save` or `--save-dev` get prefixed.\n\n    For example if a package has version `1.2.3`, by default its version is\n    set to `^1.2.3` which allows minor upgrades for that package, but after\n    `npm config set save-prefix='~'` it would be set to `~1.2.3` which\n    only allows patch upgrades.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"^"',
    typeDescription: 'String',
  },
  'save-prod': {
    key: 'save-prod',
    default: false,
    type: Boolean,
    short: 'P',
    description: '\n    Save installed packages into `dependencies` specifically. This is\n    useful if a package already exists in `devDependencies` or\n    `optionalDependencies`, but you want to move it to be a non-optional\n    production dependency.\n\n    This is the default behavior if `--save` is true, and neither\n    `--save-dev` or `--save-optional` are true.\n  ',
    flatten (key, obj, flatOptions) {
      if (!obj[key]) {
        if (flatOptions.saveType === 'prod')
          delete flatOptions.saveType
        return
      }

      flatOptions.saveType = 'prod'
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  scope: {
    key: 'scope',
    default: '',
    defaultDescription: '\n    the scope of the current project, if any, or ""\n  ',
    type: String,
    description: '\n    Associate an operation with a scope for a scoped registry.\n\n    Useful when logging in to a private registry for the first time:\n\n    ```bash\n    npm login --scope=@mycorp --registry=https://registry.mycorp.com\n    ```\n\n    This will cause `@mycorp` to be mapped to the registry for future\n    installation of packages specified according to the pattern\n    `@mycorp/package`.\n  ',
    flatten (key, obj, flatOptions) {
      const value = obj[key]
      flatOptions.projectScope = value && !/^@/.test(value) ? `@${value}` : value
    },
    typeDescription: 'String',
  },
  'script-shell': {
    key: 'script-shell',
    default: null,
    defaultDescription: "\n    '/bin/sh' on POSIX systems, 'cmd.exe' on Windows\n  ",
    type: [
      null,
      String,
    ],
    description: '\n    The shell to use for scripts run with the `npm run` command.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.scriptShell = obj[key] || undefined
    },
    typeDescription: 'null or String',
  },
  searchexclude: {
    key: 'searchexclude',
    default: '',
    type: String,
    description: '\n    Space-separated options that limit the results from search.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.search = flatOptions.search || { limit: 20 }
      flatOptions.search.exclude = obj[key]
    },
    defaultDescription: '""',
    typeDescription: 'String',
  },
  searchlimit: {
    key: 'searchlimit',
    default: 20,
    type: Number,
    description: '\n    Number of items to limit search results to. Will not apply at all to\n    legacy searches.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.search = flatOptions.search || {}
      flatOptions.search.limit = obj[key]
    },
    defaultDescription: '20',
    typeDescription: 'Number',
  },
  searchopts: {
    key: 'searchopts',
    default: '',
    type: String,
    description: '\n    Space-separated options that are always passed to search.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.search = flatOptions.search || { limit: 20 }
      flatOptions.search.opts = querystring.parse(obj[key])
    },
    defaultDescription: '""',
    typeDescription: 'String',
  },
  searchstaleness: {
    key: 'searchstaleness',
    default: 900,
    type: Number,
    description: '\n    The age of the cache, in seconds, before another registry request is made\n    if using legacy search endpoint.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.search = flatOptions.search || { limit: 20 }
      flatOptions.search.staleness = obj[key]
    },
    defaultDescription: '900',
    typeDescription: 'Number',
  },
  shell: {
    key: 'shell',
    default: '/usr/local/bin/bash',
    defaultDescription: '\n    SHELL environment variable, or "bash" on Posix, or "cmd.exe" on Windows\n  ',
    type: String,
    description: '\n    The shell to run for the `npm explore` command.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    typeDescription: 'String',
  },
  shrinkwrap: {
    key: 'shrinkwrap',
    default: true,
    type: Boolean,
    deprecated: '\n    Use the --package-lock setting instead.\n  ',
    description: '\n    Alias for --package-lock\n  ',
    flatten (key, obj, flatOptions) {
      obj['package-lock'] = obj.shrinkwrap
      definitions['package-lock'].flatten('package-lock', obj, flatOptions)
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  'sign-git-commit': {
    key: 'sign-git-commit',
    default: false,
    type: Boolean,
    description: '\n    If set to true, then the `npm version` command will commit the new\n    package version using `-S` to add a signature.\n\n    Note that git requires you to have set up GPG keys in your git configs\n    for this to work properly.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'sign-git-tag': {
    key: 'sign-git-tag',
    default: false,
    type: Boolean,
    description: '\n    If set to true, then the `npm version` command will tag the version\n    using `-s` to add a signature.\n\n    Note that git requires you to have set up GPG keys in your git configs\n    for this to work properly.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'sso-poll-frequency': {
    key: 'sso-poll-frequency',
    default: 500,
    type: Number,
    deprecated: '\n    The --auth-type method of SSO/SAML/OAuth will be removed in a future\n    version of npm in favor of web-based login.\n  ',
    description: '\n    When used with SSO-enabled `auth-type`s, configures how regularly the\n    registry should be polled while the user is completing authentication.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '500',
    typeDescription: 'Number',
  },
  'sso-type': {
    key: 'sso-type',
    default: 'oauth',
    type: [
      null,
      'oauth',
      'saml',
    ],
    deprecated: '\n    The --auth-type method of SSO/SAML/OAuth will be removed in a future\n    version of npm in favor of web-based login.\n  ',
    description: '\n    If `--auth-type=sso`, the type of SSO type to use.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"oauth"',
    typeDescription: 'null, "oauth", or "saml"',
  },
  'strict-peer-deps': {
    key: 'strict-peer-deps',
    default: false,
    type: Boolean,
    description: "\n    If set to `true`, and `--legacy-peer-deps` is not set, then _any_\n    conflicting `peerDependencies` will be treated as an install failure,\n    even if npm could reasonably guess the appropriate resolution based on\n    non-peer dependency relationships.\n\n    By default, conflicting `peerDependencies` deep in the dependency graph\n    will be resolved using the nearest non-peer dependency specification,\n    even if doing so will result in some packages receiving a peer dependency\n    outside the range set in their package's `peerDependencies` object.\n\n    When such and override is performed, a warning is printed, explaining the\n    conflict and the packages involved.  If `--strict-peer-deps` is set,\n    then this warning is treated as a failure.\n  ",
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'strict-ssl': {
    key: 'strict-ssl',
    default: true,
    type: Boolean,
    description: '\n    Whether or not to do SSL key validation when making requests to the\n    registry via https.\n\n    See also the `ca` config.\n  ',
    flatten (key, obj, flatOptions) {
      flatOptions.strictSSL = obj[key]
    },
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  tag: {
    key: 'tag',
    default: 'latest',
    type: String,
    description: "\n    If you ask npm to install a package and don't tell it a specific version,\n    then it will install the specified tag.\n\n    Also the tag that is added to the package@version specified by the `npm\n    tag` command, if no explicit tag is given.\n  ",
    flatten (key, obj, flatOptions) {
      flatOptions.defaultTag = obj[key]
    },
    defaultDescription: '"latest"',
    typeDescription: 'String',
  },
  'tag-version-prefix': {
    key: 'tag-version-prefix',
    default: 'v',
    type: String,
    description: '\n    If set, alters the prefix used when tagging a new version when performing\n    a version increment using  `npm-version`. To remove the prefix\n    altogether, set it to the empty string: `""`.\n\n    Because other tools may rely on the convention that npm version tags look\n    like `v1.0.0`, _only use this property if it is absolutely necessary_.\n    In particular, use care when overriding this setting for public packages.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '"v"',
    typeDescription: 'String',
  },
  timing: {
    key: 'timing',
    default: false,
    type: Boolean,
    description: '\n    If true, writes an `npm-debug` log to `_logs` and timing information\n    to `_timing.json`, both in your cache, even if the command completes\n    successfully.  `_timing.json` is a newline delimited list of JSON\n    objects.\n\n    You can quickly view it with this [json](https://npm.im/json) command\n    line: `npm exec -- json -g < ~/.npm/_timing.json`.\n  ',
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  tmp: {
    key: 'tmp',
    default: '/var/folders/zc/5n20yjzn7mn7cz_qckj3b3440000gn/T',
    defaultDescription: '\n    The value returned by the Node.js `os.tmpdir()` method\n    <https://nodejs.org/api/os.html#os_os_tmpdir>\n  ',
    type: path,
    deprecated: '\n    This setting is no longer used.  npm stores temporary files in a special\n    location in the cache, and they are managed by\n    [`cacache`](http://npm.im/cacache).\n  ',
    description: '\n    Historically, the location where temporary files were stored.  No longer\n    relevant.\n  ',
    typeDescription: 'Path',
  },
  umask: {
    key: 'umask',
    default: 0,
    type: Umask,
    description: '\n    The "umask" value to use when setting the file creation mode on files and\n    folders.\n\n    Folders and executables are given a mode which is `0o777` masked\n    against this value.  Other files are given a mode which is `0o666`\n    masked against this value.\n\n    Note that the underlying system will _also_ apply its own umask value to\n    files and folders that are created, and npm does not circumvent this, but\n    rather adds the `--umask` config to it.\n\n    Thus, the effective default umask value on most POSIX systems is 0o22,\n    meaning that folders and executables are created with a mode of 0o755 and\n    other files are created with a mode of 0o644.\n  ',
    flatten: (key, obj, flatOptions) => {
      const camel = key.replace(/-([a-z])/g, (_0, _1) => _1.toUpperCase())
      flatOptions[camel] = obj[key]
    },
    defaultDescription: '0',
    typeDescription: 'Octal numeric string in range 0000..0777 (0..511)',
  },
  unicode: {
    key: 'unicode',
    default: true,
    defaultDescription: '\n    false on windows, true on mac/unix systems with a unicode locale, as\n    defined by the LC_ALL, LC_CTYPE, or LANG environment variables.\n  ',
    type: Boolean,
    description: '\n    When set to true, npm uses unicode characters in the tree output.  When\n    false, it uses ascii characters instead of unicode glyphs.\n  ',
    typeDescription: 'Boolean',
  },
  'update-notifier': {
    key: 'update-notifier',
    default: true,
    type: Boolean,
    description: '\n    Set to false to suppress the update notification when using an older\n    version of npm than the latest.\n  ',
    defaultDescription: 'true',
    typeDescription: 'Boolean',
  },
  usage: {
    key: 'usage',
    default: false,
    type: Boolean,
    short: [
      '?',
      'H',
      'h',
    ],
    description: '\n    Show short usage output about the command specified.\n  ',
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  'user-agent': {
    key: 'user-agent',
    default: 'npm/{npm-version} node/{node-version} {platform} {arch} {ci}',
    type: String,
    description: '\n    Sets the User-Agent request header.  The following fields are replaced\n    with their actual counterparts:\n\n    * `{npm-version}` - The npm version in use\n    * `{node-version}` - The Node.js version in use\n    * `{platform}` - The value of `process.platform`\n    * `{arch}` - The value of `process.arch`\n    * `{ci}` - The value of the `ci-name` config, if set, prefixed with\n      `ci/`, or an empty string if `ci-name` is empty.\n  ',
    flatten (key, obj, flatOptions) {
      const value = obj[key]
      const ciName = obj['ci-name']
      flatOptions.userAgent =
      value.replace(/\{node-version\}/gi, obj['node-version'])
        .replace(/\{npm-version\}/gi, obj['npm-version'])
        .replace(/\{platform\}/gi, process.platform)
        .replace(/\{arch\}/gi, process.arch)
        .replace(/\{ci\}/gi, ciName ? `ci/${ciName}` : '')
        .trim()
    },
    defaultDescription: '"npm/{npm-version} node/{node-version} {platform} {arch} {ci}"',
    typeDescription: 'String',
  },
  userconfig: {
    key: 'userconfig',
    default: '~/.npmrc',
    type: path,
    description: '\n    The location of user-level configuration settings.\n\n    This may be overridden by the `npm_config_userconfig` environment\n    variable or the `--userconfig` command line option, but may _not_\n    be overridden by settings in the `globalconfig` file.\n  ',
    defaultDescription: '"~/.npmrc"',
    typeDescription: 'Path',
  },
  version: {
    key: 'version',
    default: false,
    type: Boolean,
    short: 'v',
    description: '\n    If true, output the npm version and exit successfully.\n\n    Only relevant when specified explicitly on the command line.\n  ',
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  versions: {
    key: 'versions',
    default: false,
    type: Boolean,
    description: "\n    If true, output the npm version as well as node's `process.versions`\n    map and the version in the current working directory's `package.json`\n    file if one exists, and exit successfully.\n\n    Only relevant when specified explicitly on the command line.\n  ",
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
  viewer: {
    key: 'viewer',
    default: 'man',
    defaultDescription: '\n    "man" on Posix, "browser" on Windows\n  ',
    type: String,
    description: '\n    The program to use to view help content.\n\n    Set to `"browser"` to view html help content in the default web browser.\n  ',
    typeDescription: 'String',
  },
  workspace: {
    key: 'workspace',
    default: [],
    type: [String, Array],
    short: 'w',
    envExport: false,
    description: '\n    Enable running a command in the context of the configured workspaces of the\n    current project while filtering by running only the workspaces defined by\n    this configuration option.\n\n    Valid values for the `workspace` config are either:\n\n    * Workspace names\n    * Path to a workspace directory\n    * Path to a parent workspace directory (will result in selecting all\n      workspaces within that folder)\n\n    When set for the `npm init` command, this may be set to the folder of\n    a workspace which does not yet exist, to create the folder and set it\n    up as a brand new workspace within the project.\n',
    defaultDescription: '',
    typeDescription: 'String (can be set multiple times)',
    flatten: (key, obj, flatOptions) => {
      definitions['user-agent'].flatten('user-agent', obj, flatOptions)
    },
  },
  yes: {
    key: 'yes',
    default: false,
    type: Boolean,
    short: 'y',
    description: '\n    Automatically answer "yes" to any prompts that npm might print on\n    the command line.\n  ',
    defaultDescription: 'false',
    typeDescription: 'Boolean',
  },
}
