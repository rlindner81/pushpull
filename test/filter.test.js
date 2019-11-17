jest.mock("fs")
const { readdir } = require("fs")
const { join, normalize } = require("path")
const processFilter = require("../src/filter")

const basedir = normalize(join(__dirname, ".."))
const mockCwd = jest.spyOn(process, "cwd").mockImplementation(() => "/cwd")

const mockReaddir = hierarchy => {
  readdir.mockImplementation((startDir, opts, cb) => {
    const entries = hierarchy[startDir].map(e => {
      return typeof e === "string"
        ? { name: e, isDirectory: () => false, isFile: () => true }
        : { name: e.sub, isDirectory: () => true, isFile: () => false }
    })
    cb(null, entries)
  })
}

beforeEach(() => {
  mockCwd.mockClear()
})

test("filter for single file", () => {
  mockReaddir({ [join("/cwd")]: ["a", "b", "c", ".a", "a.a", "a."] })
  return processFilter("*.a").then(result => {
    expect(result).toEqual([join("/cwd", "a.a")])
  })
})

test("filter with absolute filepath", () => {
  mockReaddir({ [basedir]: ["a"] })
  return processFilter(join(basedir, "a")).then(result => {
    expect(mockCwd).toBeCalledTimes(0)
    expect(result).toEqual([join(basedir, "a")])
  })
})

test("filter with relative filepath", () => {
  mockReaddir({ [join("/cwd")]: ["a"] })
  return processFilter("a").then(result => {
    expect(mockCwd).toBeCalledTimes(1)
    expect(result).toEqual([join("/cwd", "a")])
  })
})

test("filter withSubDir", () => {
  mockReaddir({
    [join("/cwd")]: [{ sub: "a" }, "a", "b", "c", ".a", "a.a", "a."],
    [join("/cwd", "a")]: [{ sub: "b" }, { sub: "c" }, "a", "b", "c", ".a", "a.a", "a."],
    [join("/cwd", "a", "b")]: ["a", "b", "c", ".a", "a.a", "a."],
    [join("/cwd", "a", "c")]: ["a", "b", "c", ".a", "a."]
  })
  return processFilter("**/*.a").then(result => {
    expect(result).toEqual([join("/cwd", "a.a"), join("/cwd", "a", "a.a"), join("/cwd", "a", "b", "a.a")])
  })
})