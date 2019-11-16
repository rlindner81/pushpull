const fs = require("fs")
const { join } = require("path")
const { promisify } = require("util")
const readdirAsync = promisify(fs.readdir)
const minimatch = require("minimatch")
const { assert } = require("./helper")

const _processFilterDirectory = (filterRe, root, sub = "", filepaths = []) => {
  const current = sub === null ? root : join(root, sub)
  return readdirAsync(current, { withFileTypes: true })
    .then(fileEntries => {
      return Promise.all(
        fileEntries.map(fileEntry => {
          const relativeFilepath = join(sub, fileEntry.name)
          if (filterRe.exec(relativeFilepath) === null) {
            return
          }
          if (fileEntry.isDirectory()) {
            return _processFilterDirectory(filterRe, root, relativeFilepath, filepaths)
          } else if (fileEntry.isFile()) {
            const filepath = join(current, fileEntry.name)
            filepaths.push(filepath)
          }
        })
      )
    })
    .then(() => {
      return filepaths
    })
}

const processFilter = filter => {
  const filterRe = minimatch.makeRe(filter)
  const root = process.cwd()
  return _processFilterDirectory(filterRe, root).then(filepaths => {
    assert(filepaths.length !== 0, `found no filepaths matching ${filter} in ${root}`)
    return filepaths
  })
}

module.exports = processFilter
