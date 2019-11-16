const { join } = require("path")
const { readFileSync, writeFileSync, readdirSync } = require("fs")
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

const escapeRegExp = input => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const pushRe = string => {
  const stringEscaped = escapeRegExp(string)
  return RegExp(`^(\\s*)(${stringEscaped})(\\s*)(.*?)(\\s*)$`, "gm")
}

const pullRe = string => {
  const stringEscaped = escapeRegExp(string)
  return RegExp(`^(\\s*)(.*?)(\\s*)(${stringEscaped})(\\s*)$`, "gm")
}

const switchRe = string => {
  const stringEscaped = escapeRegExp(string)
  return RegExp(`^(\\s*)(?:(${stringEscaped})(\\s*)(.*?)|(.*?)(\\s*)(${stringEscaped}))(\\s*)$`, "gm")
}

const pushPullReplacer = (_, a, b, c, d, e) => a + d + c + b + e

const switchReplacer = (_, a, b, c, d, e, f, g, h) => (b !== undefined ? a + d + c + b + h : a + g + f + e + h)

const processDirectives = (filepaths, directives) => {
  const directivesRe = directives.map(([type, string]) => {
    switch (type) {
      case "push":
        return [pushRe(string), pushPullReplacer]
      case "pull":
        return [pullRe(string), pushPullReplacer]
      case "switch":
        return [switchRe(string), switchReplacer]
      default:
        assert(false, `encountered unknown directive ${type}`)
        break
    }
  })
  for (const filepath of filepaths) {
    let processed = false
    let data = readFileSync(filepath).toString()
    for (const [directiveRe, replacer] of directivesRe) {
      data = data.replace(directiveRe, (...args) => {
        processed = true
        return replacer.apply(null, args)
      })
    }
    if (processed) {
      console.log(`changed ${filepath}`)
      writeFileSync(filepath, data)
    }
  }
}

module.exports = {
  processFilter,
  processDirectives
}
