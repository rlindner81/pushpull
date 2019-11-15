const PushPull = (filter, processors) => {
  if (!Array.isArray(processors) || processors.length === 0) {
    return null
  }
  this.push = pushRe(push)
  this.pull = pullRe(pull)
  return this
}

const filePushPull = (filepath, pushRe, pullRe) => {}

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

const strip = input => input.replace(/^\s*(.*?)\s*$/, "$1")

const escapeRegExp = input => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const pushRe = push => {
  const pushStrippedEscaped = escapeRegExp(strip(push))
  return pushStrippedEscaped.length > 0 ? RegExp(`^(\\s*)(${pushStrippedEscaped})(\\s*)(.*?)(\\s*)$`, "g") : null
}
const pullRe = pull => {
  const pullStrippedEscaped = escapeRegExp(strip(pull))
  return pullStrippedEscaped.length > 0 ? RegExp(`^(\\s*)(.*?)(\\s*)(${pullStrippedEscaped})(\\s*)$`, "g") : null
}

const testIt = () => {
  // const line = "   // \HANA_IN       a, bbb"
  const line = "   a, bbb  // \\HANA_OUT_D"
  const push = "// HANA_IN"
  const pull = "// \\HANA_OUT"

  console.log(`${line}\n${linePushPull(line, pushRe(push), pullRe(pull))}`)
}

testIt()
