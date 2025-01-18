---
outline: deep
---

# Text is selected by default when dragging the mouse over text

To not interfere with text-selection, selection-js won't prevent any default events anymore (as of `v2.0.3`).
This, however, can cause problems with the actual selection ("introduced" by [#99](https://github.com/Simonwep/selection/pull/99), reported in [#103](https://github.com/Simonwep/selection/issues/103)).
If you don't care about text-selection, add the following to the container where all your selectables are located:

```css
.container {
    user-select: none;
}
```
