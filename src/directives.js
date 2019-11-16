const fs = require("fs")
const { promisify } = require("util")
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const { assert, escapeRegExp, noop } = require("./helper")

const _pushRe = string => {
  const stringEscaped = escapeRegExp(string)
  return RegExp(`^(\\s*)(${stringEscaped})(\\s*)(.*?)(\\s*)$`, "gm")
}

const _pullRe = string => {
  const stringEscaped = escapeRegExp(string)
  return RegExp(`^(\\s*)(.*?)(\\s*)(${stringEscaped})(\\s*)$`, "gm")
}

const _switchRe = string => {
  const stringEscaped = escapeRegExp(string)
  return RegExp(`^(\\s*)(?:(${stringEscaped})(\\s*)(.*?)|(.*?)(\\s*)(${stringEscaped}))(\\s*)$`, "gm")
}

const _pushPullReplacer = (_, a, b, c, d, e) => a + d + c + b + e

const _switchReplacer = (_, a, b, c, d, e, f, g, h) => (b !== undefined ? a + d + c + b + h : a + g + f + e + h)

const processDirectives = (filepaths, directives, log = noop) => {
  const directivesRe = directives.map(([type, string]) => {
    switch (type) {
      case "push":
        return [_pushRe(string), _pushPullReplacer]
      case "pull":
        return [_pullRe(string), _pushPullReplacer]
      case "switch":
        return [_switchRe(string), _switchReplacer]
      default:
        assert(false, `encountered unknown directive ${type}`)
        break
    }
  })
  return Promise.all(
    filepaths.map(filepath => {
      let changes = 0
      return readFileAsync(filepath).then(bytes => {
        let data = bytes.toString()
        for (const [directiveRe, replacer] of directivesRe) {
          data = data.replace(directiveRe, (...args) => {
            changes++
            return replacer.apply(null, args)
          })
        }
        if (changes > 0) {
          log(`${changes} changes in ${filepath}`)
          return writeFileAsync(filepath, data)
        }
      })
    })
  )
}

module.exports = processDirectives
