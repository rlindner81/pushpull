const { sep, join } = require("path")
const { readFileSync, writeFileSync, readdirSync } = require("fs")
const minimatch = require("minimatch")
const { assert } = require("./helper")

// const PushPull = (filter, processors) => {
//   if (!Array.isArray(processors) || processors.length === 0) {
//     return null
//   }
//   this.push = pushRe(push)
//   this.pull = pullRe(pull)
//   return this
// }

// const filePushPull = (filepath, pushRe, pullRe) => {}

const testIt = () => {
  // const line = "   // \HANA_IN       a, bbb"
  const line = "   a, bbb  // \\HANA_OUT_D"
  const push = "// HANA_IN"
  const pull = "// \\HANA_OUT"

  console.log(`${line}\n${linePushPull(line, pushRe(push), pullRe(pull))}`)
}

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

const linePushPull = (line, pushRe, pullRe) => {
  let result = line
  if (pushRe !== null) {
    result = result.replace(pushRe, "$1$4$3$2$5")
  }
  if (pullRe !== null) {
    result = result.replace(pullRe, "$1$4$3$2$5")
  }
  return result
}

const escapeRegExp = input => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const pushRe = push => {
  const pushStrippedEscaped = escapeRegExp(push.trim())
  return pushStrippedEscaped.length > 0 ? RegExp(`^(\\s*)(${pushStrippedEscaped})(\\s*)(.*?)(\\s*)$`, "gm") : null
}
const pullRe = pull => {
  const pullStrippedEscaped = escapeRegExp(pull.trim())
  return pullStrippedEscaped.length > 0 ? RegExp(`^(\\s*)(.*?)(\\s*)(${pullStrippedEscaped})(\\s*)$`, "gm") : null
}

const processDirectives = (filepaths, directives) => {
  const directivesRe = directives.map(([type, string]) => {
    switch (type) {
      case "push":
        return pushRe(string)
      case "pull":
        return pullRe(string)
      case "switch":
        assert(false, "not implemented yet")
        break
      default:
        assert(false, `encountered unknown directive ${type}`)
        break
    }
  })
  for (const filepath of filepaths) {
    let processed = false
    let data = readFileSync(filepath).toString()
    for (const directiveRe of directivesRe) {
      data = data.replace(directiveRe, (_, a, b, c, d, e) => {
        processed = true
        return a + d + c + b + e
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
