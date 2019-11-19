const { readFileSync } = require("fs");
const { join } = require("path")
const { usage, parseArgs } = require("../src/args");

test("usagelog", () => {
  const usageLog = usage();
  const readme = readFileSync(join(__dirname, "..", "README.md")).toString();
  const i = 0;
  expect(usageLog).toEqual(readme);
});
