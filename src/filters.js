const fs = require("fs")
const { join, parse, normalize, isAbsolute } = require("path")
const { promisify } = require("util")
const readdirAsync = promisify(fs.readdir)
const { assert, escapeRegExp, noop } = require("./helper")

const IGNORE_DIRECTORIES = [".git", "node_modules"]

const _processFilterDirectory = (dir, matchesFilepath, result = []) => {
  return readdirAsync(dir, { withFileTypes: true })
    .then(fileEntries => {
      return Promise.all(
        fileEntries.map(fileEntry => {
          const filepath = join(dir, fileEntry.name)
          if (fileEntry.isDirectory() && IGNORE_DIRECTORIES.indexOf(fileEntry.name) === -1) {
            return _processFilterDirectory(filepath, matchesFilepath, result)
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

const _matchesFilepath = ({ dir, name, ext }) => {
  const dirRe =
    process.platform === "win32"
      ? RegExp(`^${escapeRegExp(dir).replace(/\\\\\\\*\\\*/g, ".*?")}$`) // escaped version of \\**
      : RegExp(`^${escapeRegExp(dir).replace(/\/\\\*\\\*/g, ".*?")}$`) // escaped version of /**
  const nameRe = RegExp(`^${escapeRegExp(name).replace(/\\\*/g, ".*?")}$`)
  const extRe = RegExp(`^${escapeRegExp(ext).replace(/\\\*/g, ".*?")}$`)
  return filepath => {
    const { dir, name, ext } = parse(filepath)
    return dirRe.test(dir) && nameRe.test(name) && extRe.test(ext)
  }
}

const _dirFixedPart = parts => parts.dir.replace(/^(.*?)\*\*.*$/, "$1")

const processFilter = (input, log = noop) => {
  const inputNormalized = normalize(input)
  const inputAbsolute = isAbsolute(inputNormalized) ? inputNormalized : join(process.cwd(), inputNormalized)
  const inputParts = parse(inputAbsolute)
  return _processFilterDirectory(_dirFixedPart(inputParts), _matchesFilepath(inputParts))
}

module.exports = processFilter
