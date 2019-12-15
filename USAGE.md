# Switch
If you have mutually exclusive states and a configuration that doesn't support contradicting options, you can use the switch statement.
```
.npmrc (before)
package-lock=false #WRITE_LOCK
#WRITE_LOCK package-lock=true

pushpull config.xml --switch '#WRITE_LOCK'

.npmrc (after)
#WRITE_LOCK package-lock=false
package-lock=true #WRITE_LOCK
```
Note that you should not mix `--switch` and `--push/--pull` with the same markers.

# Multiline comments
It's easy to use line comments as markers for pushpull, but you can also use multiline comments, by having the comment terminator on the next line.
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
