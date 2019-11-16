const assert = (condition, errorMessage) => {
  if (!condition) {
    console.error("error: " + errorMessage)
    process.exit(-1)
  }
}

// https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
const ordinal = a =>
  a + ["th", "st", "nd", "rd"][((a = ~~(a < 0 ? -a : a) % 100) > 10 && a < 14) || (a %= 10) > 3 ? 0 : a]

const escapeRegExp = input => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const noop = () => {}

module.exports = {
  assert,
  ordinal,
  escapeRegExp,
  noop
}
