// The point of this test is to collect the snapshots for different platforms
const { execSync } = require("child_process")

const run = cmd => {
  let result = null
  try {
    result = execSync(cmd, {
      stdio: [null, "pipe", null]
    }).toString()
  } catch (err) {
    result = err.message
  }
  return result
}

const testStrings = input => {
  return [run(`echo unquoted: ${input}`), run(`echo single-quoted: '${input}'`), run(`echo double-quoted: "${input}"`)]
}

const testAll = () => {
  return {
    expand: testStrings("**/*.js"),
    "hash-arg": testStrings("#ARG"),
    "slash-arg": testStrings("//ARG"),
    "dash-arg": testStrings("--ARG"),
    "amp-arg": testStrings("&&ARG")
  }
}

test("shelltest win32", () => {
  if (process.platform === "win32") {
    expect(testAll()).toMatchSnapshot()
  }
})

test("shelltest darwin", () => {
  if (process.platform === "darwin") {
    expect(testAll()).toMatchSnapshot()
  }
})

test("shelltest linux", () => {
  if (process.platform === "linux") {
    expect(testAll()).toMatchSnapshot()
  }
})
