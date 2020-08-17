const typeDefs = require('../lib/type-defs.js')
const t = require('tap')
const { semver: { validate: validateSemver }} = typeDefs
const d = { semver: 'foobar' }
t.equal(validateSemver(d, 'semver', 'foobar'), false)
t.equal(validateSemver(d, 'semver', 'v1.2.3'), undefined)
t.equal(d.semver, '1.2.3')
