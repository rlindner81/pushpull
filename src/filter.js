const fs = require("fs")
const { join, parse, normalize, isAbsolute } = require("path")
const { promisify } = require("util")
const readdirAsync = promisify(fs.readdir)
const { assert, escapeRegExp } = require("./helper")

const IGNORE_DIRECTORIES = [".git", "node_modules"]

const _processFilterDirectory = (startDir, withSubDirs, matchesFilepath, result = []) => {
  return readdirAsync(startDir, { withFileTypes: true })
    .then(fileEntries => {
      return Promise.all(
        fileEntries.map(fileEntry => {
          const filepath = join(startDir, fileEntry.name)
          if (fileEntry.isDirectory() && withSubDirs && IGNORE_DIRECTORIES.indexOf(fileEntry.name) === -1) {
            return _processFilterDirectory(filepath, withSubDirs, matchesFilepath, result)
          } else if (fileEntry.isFile() && matchesFilepath(filepath)) {
            result.push(filepath)
          }
        })
      )
    })
    .catch(err => {
      assert(err.code !== "ENOENT", `invalid starting directory ${startDir}`)
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
  const nameRe =
    name.length === 0 ? /^$/ : name === "*" ? /^.*$/ : RegExp(`^${escapeRegExp(name).replace(/\\\*/g, ".*?")}$`)
  const extRe =
    ext.length === 0 ? /^$/ : ext === ".*" ? /^.*$/ : RegExp(`^${escapeRegExp(ext).replace(/\\\*/g, ".*?")}$`)
  return filepath => {
    const { dir, name, ext } = parse(filepath)
    return dirRe.test(dir) && nameRe.test(name) && extRe.test(ext)
  }
}

const _prepare = input => {
  const inputNormalized = normalize(input)
  const inputAbsolute = isAbsolute(inputNormalized) ? inputNormalized : join(process.cwd(), inputNormalized)
  const inputParts = parse(inputAbsolute)

  const { dir } = inputParts
  let withSubDirs = false
  const startDirRe = process.platform === "win32" ? /\\\*\*.*$/g : /\/\*\*.*$/g
  const startDir = dir.replace(startDirRe, () => {
    withSubDirs = true
    return ""
  })
  const matchesFilepath = _matchesFilepath(inputParts)
  return [startDir, withSubDirs, matchesFilepath]
}

const processFilter = input => {
  return _processFilterDirectory(..._prepare(input))
}

module.exports = processFilter
