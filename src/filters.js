const { join } = require("path")
const { readdirSync } = require("fs")
const minimatch = require("minimatch")
const { assert } = require("./helper")

const _processFilterDirectory = (filterRe, root, sub = "", filepaths = []) => {
  const current = sub === null ? root : join(root, sub)
  for (const fileEntry of readdirSync(current, { withFileTypes: true })) {
    const relativeFilepath = join(sub, fileEntry.name)
    if (filterRe.exec(relativeFilepath) === null) {
      continue
    }
    if (fileEntry.isDirectory()) {
      _processFilterDirectory(filterRe, root, relativeFilepath, filepaths)
    } else if (fileEntry.isFile()) {
      const filepath = join(current, fileEntry.name)
      filepaths.push(filepath)
    }
  }
  return filepaths
}

const processFilter = filter => {
  const filterRe = minimatch.makeRe(filter)
  const root = process.cwd()
  const filepaths = _processFilterDirectory(filterRe, root)
  assert(filepaths.length !== 0, `found no filepaths matching ${filter} in ${root}`)
  return filepaths
}

module.exports = processFilter
