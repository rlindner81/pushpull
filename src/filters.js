const fs = require("fs")
const { join, parse, format, normalize, isAbsolute } = require("path")
const { promisify } = require("util")
const readdirAsync = promisify(fs.readdir)
const minimatch = require("minimatch")
const { assert, escapeRegExp } = require("./helper")

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

const _matchesDir = parts => {
  return RegExp(escapeRegExp(filter).replace("\\*\\*", ""), "g")
}

const _matchesFile = parts => {
  return RegExp(escapeRegExp(filter).replace("\\*\\*", ""), "g")
}

const processFilter = (input, log = console.log) => {
  const inputNormalized = normalize(input)
  const inputAbsolute = isAbsolute(inputNormalized) ? inputNormalized : join(process.cwd(), inputNormalized)
  const inputParts = parse(inputAbsolute)
  log("inputFormatted", format(inputParts))
  log("inputParts", JSON.stringify(inputParts))
  process.exit(0)
  // const filterRe = minimatch.makeRe(filter) // _filterRe(filterNormalized)
  return _processFilterDirectory(inputParts.dir, _matchesDir(inputParts), _matchesFile(inputParts)).then(filepaths => {
    return filepaths
  })
}

module.exports = processFilter
