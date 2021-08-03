const walkUp = require('walk-up-path')
const { relative, resolve } = require('path')
const { promisify } = require('util')
const fs = require('fs')
const stat = promisify(fs.stat)

// starting from the start dir, walk up until we hit the first
// folder with a node_modules or package.json.  if none are found,
// then return the start dir itself.
module.exports = async (start, end = null) => {
  for (const p of walkUp(start)) {
    // walk up until we have a nm dir or a pj file
    const hasAny = (await Promise.all([
      stat(resolve(p, 'node_modules'))
        .then(st => st.isDirectory())
        .catch(() => false),
      stat(resolve(p, 'package.json'))
        .then(st => st.isFile())
        .catch(() => false),
    ])).some(is => is)
    if (hasAny)
      return p
    if (end && relative(p, end) === '')
      break
  }

  return start
}
