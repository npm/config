const envReplace = require('../lib/env-replace.js')
const t = require('tap')

const env = {
  foo: 'bar',
  bar: 'baz',
}

t.equal(envReplace('\\${foo}', env),  '${foo}')
t.equal(envReplace('\\\\${foo}', env),  '\\bar')
t.throws(() => envReplace('${baz}', env), {
  message: 'Failed to replace env in config: ${baz}',
})
