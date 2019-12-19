# Usage examples

## On/off aliases
Instead of `--push/--pull` you can use the aliases `--on/--off` to make things more readable.
```
.npmrc (before)
registry=https://registry.npmjs.org #NPM
#GITHUB registry=https://npm.pkg.github.com

pushpull .npmrc --on '#GITHUB' --off '#NPM'

.npmrc (after)
#NPM registry=https://registry.npmjs.org
registry=https://npm.pkg.github.com #GITHUB
```

## Markers with wildcards
You can use the `*` wildcard in markers to hit multiple. This is useful if you don't know which of multiple options is currently enabled.
```
.npmrc (before)
registry=https://registry.npmjs.org #REG_NPM
#REG_GITHUB registry=https://npm.pkg.github.com
#REG_CUSTOM registry=https://npm.company.com

pushpull .npmrc --off '#REG*' --on '#REG*CUSTOM'

.npmrc (after)
#REG_NPM registry=https://registry.npmjs.org
#REG_GITHUB registry=https://npm.pkg.github.com
registry=https://npm.company.com #REG_CUSTOM
```

## Switch directive
If you have mutually exclusive states and a configuration that doesn't support contradicting options, you can use the `--switch` directive.
```
.npmrc (before)
package-lock=false #WRITE_LOCK
#WRITE_LOCK package-lock=true

pushpull .npmrc --switch '#WRITE_LOCK'

.npmrc (after)
#WRITE_LOCK package-lock=false
package-lock=true #WRITE_LOCK
```
Note that you should not mix `--switch` and `--push/--pull` with the same markers.

## Multiline comments
It's easy to use line comments as markers for PushPull, but you can also use multiline comments by having the comment terminator on the next line.
```
config.xml (before)
...
  <option>deleteall</option> <!--DELETE
  -->

pushpull config.xml --pull '<!--DELETE'

config.xml (after)
...
  <!--DELETE <option>deleteall</option>
  -->
```