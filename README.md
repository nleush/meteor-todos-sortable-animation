## Known issues

### Full item rerender on change.

I don't know yet how to rerender template using updated context data. So, for now,every time data is changed - old template deleted and new one created.

Anybody know to to fix it?

Inputs preservations will not work between binded data item changes.

### Prevent list item rerender on mousedown

`sortable` will work with element after mousedown. Don't make rerender events on mousedown, becuase `sortable` will not like it.

### Only first change shown as animation.

If many changes occurs - only first of them will be animated.
