const fs = require("fs")
const { join, parse, format, normalize, isAbsolute } = require("path")
const { promisify } = require("util")
const readdirAsync = promisify(fs.readdir)
const { assert, escapeRegExp, noop } = require("./helper")

const IGNORE_DIRECTORIES = [".git", "node_modules"]

const _processFilterDirectory = (dir, shouldDescendDirectory, matchesFilepath, result = []) => {
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
            return _processFilterDirectory(filepath, shouldDescendDirectory, matchesFilepath, result)
            // .then(subResult => {
            //   result = result.concat(subResult)
            // })
          } else if (fileEntry.isFile() && matchesFilepath(filepath)) {
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

const _shouldDescendDirectory = parts => {
  const dirRe = RegExp(`^${escapeRegExp(parts.dir).replace(/\\\*\\\*/g, ".*?")}$`)
  return filepath => {
    const { dir } = parse(filepath)
    return dirRe.test(dir)
  }
}

const _matchesFilepath = parts => {
  const dirRe = RegExp(`^${escapeRegExp(parts.dir).replace(/\\\*\\\*/g, ".*?")}$`)
  const nameRe = RegExp(`^${escapeRegExp(parts.name).replace(/\\\*/g, ".*?")}$`)
  const extRe = RegExp(`^${escapeRegExp(parts.ext).replace(/\\\*/g, ".*?")}$`)
  return filepath => {
    const { dir, name, ext } = parse(filepath)
    return dirRe.test(dir) && nameRe.test(name) && extRe.test(ext)
  }
}

const _startDir = parts => parts.dir.replace(/^(.*?)\*\*.*$/, "$1")

const processFilter = (input, log = noop) => {
  const inputNormalized = normalize(input)
  const inputAbsolute = isAbsolute(inputNormalized) ? inputNormalized : join(process.cwd(), inputNormalized)
  const inputParts = parse(inputAbsolute)
  log("inputFormatted", format(inputParts))
  log("inputParts", JSON.stringify(inputParts))
  return _processFilterDirectory(
    _startDir(inputParts),
    _shouldDescendDirectory(inputParts),
    _matchesFilepath(inputParts)
  )
}

module.exports = processFilter
