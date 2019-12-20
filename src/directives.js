"use strict"

const fs = require("fs")
const { promisify } = require("util")
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const { assert, escapeRegExp, noop } = require("./helper")

const _prepareMarker = marker =>
  escapeRegExp(marker)
    // goal is to unescape with \, i.e., escapeRegExp(\X) = \\(\?X) and replace it with \?X
    // and expand normal *, i.e., escapeRegExp(*) = \\\* and replace it with \S*
    .replace(/(?:\\\\((?:\\)?.)|\\\*)/g, (match, unescaped) => (unescaped !== undefined ? unescaped : "\\S*"))

const _pushRe = marker => RegExp(`^(\\s*)(${_prepareMarker(marker)})([^\\S\\r\\n]+)(.*?)(\\s*)$`, "gm")

const _pullRe = marker => RegExp(`^(\\s*)(.*?)([^\\S\\r\\n]+)(${_prepareMarker(marker)})(\\s*)$`, "gm")

const _switchRe = marker => {
  const preparedMarker = _prepareMarker(marker)
  return RegExp(`^(\\s*)(?:(${preparedMarker})([^\\S\\r\\n]+)(.*?)|(.*?)([^\\S\\r\\n]+)(${preparedMarker}))(\\s*)$`, "gm")
}

const _pushPullReplacer = (_, a, b, c, d, e) => a + d + c + b + e

const _switchReplacer = (_, a, b, c, d, e, f, g, h) => (b !== undefined ? a + d + c + b + h : a + g + f + e + h)

const processDirectives = (filepaths, directives, log = noop) => {
  const directivesRe = directives.map(([type, marker]) => {
    switch (type) {
      case "push":
        return [_pushRe(marker), _pushPullReplacer]
      case "pull":
        return [_pullRe(marker), _pushPullReplacer]
      case "switch":
        return [_switchRe(marker), _switchReplacer]
      default:
        return assert(false, `encountered unknown directive ${type}`)
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
