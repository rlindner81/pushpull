/* eslint-disable jest/no-conditional-expect */
"use strict";

// The point of this test is to collect the snapshots for different platforms
const { execSync } = require("child_process");

const run = (cmd) => {
  let result;
  try {
    result = execSync(cmd, {
      stdio: [null, "pipe", null],
    }).toString();
  } catch (err) {
    result = err.message;
  }
  return result;
};

const runAndFilter = (cmd) => run(cmd).replace(/\s(?:node_modules|test)\/\S+/g, "");

const testStrings = (input) => {
  return [
    runAndFilter(`echo unquoted: ${input}`),
    run(`echo single-quoted: '${input}'`),
    run(`echo double-quoted: "${input}"`),
  ];
};

const testAll = () => {
  return {
    expand: testStrings("**/*.js"),
    "hash-arg": testStrings("#ARG"),
    "slash-arg": testStrings("//ARG"),
    "dash-arg": testStrings("--ARG"),
    "amp-arg": testStrings("&&ARG"),
  };
};

test("shelltest win32", () => {
  if (process.platform === "win32") {
    expect(testAll()).toMatchInlineSnapshot(`
      {
        "amp-arg": [
          "Command failed: echo unquoted: &&ARG
      'ARG' is not recognized as an internal or external command,
      operable program or batch file.
      ",
          "Command failed: echo single-quoted: '&&ARG'
      'ARG'' is not recognized as an internal or external command,
      operable program or batch file.
      ",
          "double-quoted: \\"&&ARG\\"
      ",
        ],
        "dash-arg": [
          "unquoted: --ARG
      ",
          "single-quoted: '--ARG'
      ",
          "double-quoted: \\"--ARG\\"
      ",
        ],
        "expand": [
          "unquoted: **/*.js
      ",
          "single-quoted: '**/*.js'
      ",
          "double-quoted: \\"**/*.js\\"
      ",
        ],
        "hash-arg": [
          "unquoted: #ARG
      ",
          "single-quoted: '#ARG'
      ",
          "double-quoted: \\"#ARG\\"
      ",
        ],
        "slash-arg": [
          "unquoted: //ARG
      ",
          "single-quoted: '//ARG'
      ",
          "double-quoted: \\"//ARG\\"
      ",
        ],
      }
    `);
  }
});

test("shelltest darwin", () => {
  if (process.platform === "darwin") {
    expect(testAll()).toMatchInlineSnapshot(`
      {
        "amp-arg": [
          "Command failed: echo unquoted: &&ARG
      /bin/sh: ARG: command not found
      ",
          "single-quoted: &&ARG
      ",
          "double-quoted: &&ARG
      ",
        ],
        "dash-arg": [
          "unquoted: --ARG
      ",
          "single-quoted: --ARG
      ",
          "double-quoted: --ARG
      ",
        ],
        "expand": [
          "unquoted: bin/cli.js src/args.js src/directives.js src/filter.js src/helper.js src/index.js
      ",
          "single-quoted: **/*.js
      ",
          "double-quoted: **/*.js
      ",
        ],
        "hash-arg": [
          "unquoted:
      ",
          "single-quoted: #ARG
      ",
          "double-quoted: #ARG
      ",
        ],
        "slash-arg": [
          "unquoted: //ARG
      ",
          "single-quoted: //ARG
      ",
          "double-quoted: //ARG
      ",
        ],
      }
    `);
  }
});

test("shelltest linux", () => {
  if (process.platform === "linux") {
    expect(testAll()).toMatchInlineSnapshot(`
      {
        "amp-arg": [
          "Command failed: echo unquoted: &&ARG
      /bin/sh: 1: ARG: not found
      ",
          "single-quoted: &&ARG
      ",
          "double-quoted: &&ARG
      ",
        ],
        "dash-arg": [
          "unquoted: --ARG
      ",
          "single-quoted: --ARG
      ",
          "double-quoted: --ARG
      ",
        ],
        "expand": [
          "unquoted: bin/cli.js src/args.js src/directives.js src/filter.js src/helper.js src/index.js
      ",
          "single-quoted: **/*.js
      ",
          "double-quoted: **/*.js
      ",
        ],
        "hash-arg": [
          "unquoted:
      ",
          "single-quoted: #ARG
      ",
          "double-quoted: #ARG
      ",
        ],
        "slash-arg": [
          "unquoted: //ARG
      ",
          "single-quoted: //ARG
      ",
          "double-quoted: //ARG
      ",
        ],
      }
    `);
  }
});
