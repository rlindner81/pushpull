const fs = require("fs")
const { join, parse, format, normalize, isAbsolute } = require("path")
const { promisify } = require("util")
const readdirAsync = promisify(fs.readdir)
const { assert, escapeRegExp, noop } = require("./helper")

const IGNORE_DIRECTORIES = [".git", "node_modules"]

const _processFilterDirectory = (dir, shouldDescendDirectory, matchesFile, result = []) => {
  return readdirAsync(dir, { withFileTypes: true })
    .then(fileEntries => {
      return Promise.all(
        fileEntries.map(fileEntry => {
          const filepath = join(dir, fileEntry.name)
          if (
            fileEntry.isDirectory() &&
            IGNORE_DIRECTORIES.indexOf(fileEntry.name) === -1 &&
            shouldDescendDirectory(filepath)
          ) {
            return _processFilterDirectory(filepath, shouldDescendDirectory, matchesFile, result)
            // .then(subResult => {
            //   result = result.concat(subResult)
            // })
          } else if (fileEntry.isFile() && matchesFile(filepath)) {
            result.push(filepath)
          }
        })
      )
    })
    .catch(err => {
      assert(err.code !== "ENOENT", `invalid starting directory ${dir}`)
      throw err
    })
    .then(() => {
      return result
    })
}

// eslint-disable-next-line no-unused-vars
const _shouldDescendDirectory = parts => {
  // eslint-disable-next-line no-unused-vars
  return filepath => {
    return false
  }
}

const _matchesFile = parts => {
  const nameRe = RegExp(`^${escapeRegExp(parts.name).replace(/\\\*/g, ".*?")}$`)
  const extRe = RegExp(`^${escapeRegExp(parts.ext).replace(/\\\*/g, ".*?")}$`)
  return filepath => {
    const { name, ext } = parse(filepath)
    return nameRe.test(name) && extRe.test(ext)
  }
}

const _startDir = parts => parts.dir.replace(/^(.*?)\*\*.*$/, "$1")

const processFilter = (input, log = noop) => {
  const inputNormalized = normalize(input)
  const inputAbsolute = isAbsolute(inputNormalized) ? inputNormalized : join(process.cwd(), inputNormalized)
  const inputParts = parse(inputAbsolute)
  log("inputFormatted", format(inputParts))
  log("inputParts", JSON.stringify(inputParts))
  return _processFilterDirectory(_startDir(inputParts), _shouldDescendDirectory(inputParts), _matchesFile(inputParts))
}

module.exports = processFilter
