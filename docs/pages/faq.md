---
outline: deep
---

# FAQs

The following are some common questions and answers about `viselect`.

[[toc]]

> [!TIP]
> Your question isn't answered here? [Open a discussion](https://github.com/simonwep/viselect/discussions) and ask your question there!
> ...or  submit a [PR](https://github.com/simonwep/viselect/compare) or create an [issue](https://github.com/simonwep/viselect/issues/new?assignees=simonwep&labels=&template=feature_request.md&title=) if you got any ideas for more examples!

## Browser support

This library will always produce an ESNext bundle.
If you want to support legacy browsers, please use the feature of your bundler to transpile dependencies.
In case of webpack and babel (give [vite](https://vitejs.dev/) a try, it's awesome) you'll have to install corresponding plugins such as [babel-plugin-proposal-optional-chaining](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining) and include the dependency from `node_modules` which is normally entirely excluded from being processed.

I do this to provide maximum flexibility and give those who target ESNext a chance to make full use of how this library is bundled.
Everything else is just a matter of configuration :)

## Preventing text selection

To not interfere with text-selection, selection-js won't prevent any default events anymore (as of `v2.0.3`).
This, however, can cause problems with the actual selection ("introduced" by [#99](https://github.com/simonwep/viselect/pull/99), reported in [#103](https://github.com/simonwep/viselect/issues/103)).
If you don't care about text-selection, add the following to the container where all your selectables are located:

```css
.container {
    user-select: none;
}
```

Another solution is to make the document during a selection non-selectable:

```ts
selection
    .on('beforestart', () => document.body.style.userSelect = 'none')
    .on('stop', () => document.body.style.userSelect = 'unset');
```

Issues: [#103](https://github.com/simonwep/viselect/issues/103)

## Changing selectables during a selection

In some cases you may add / remove selectables during a selection, especially when it comes to scrolling.
In this case make sure to call `selection.resolveSelectables()` every time you add / remove a selectable so that viselect is aware of the change.
Consult the [api reference](./api-reference.md) for more information.


## Allowing the user to scroll with two fingers

```js
selection.on('beforestart', (() => {
  let timeout = null;

  return ({event}) => {

    // Check if user already tapped inside of a selection-area.
    if (timeout !== null) {

      // A second pointer-event occured, ignore that one.
      clearTimeout(timeout);
      timeout = null;
    } else {

      // Wait 50ms in case the user uses two fingers to scroll.
      timeout = setTimeout(() => {

        // OK User used only one finger, we can safely initiate a selection and reset the timer.
        selection.trigger(event);
        timeout = null;
      }, 50);
    }

    // Never start automatically.
    return false;
  };
})());
```

Issues: [#70](https://github.com/simonwep/viselect/issues/70)

## Preventing the start of a selection based on certain conditions 

```js
selection.on('beforestart', ({event}) => {
  return !event.path.some(item => {

    // item is in this case an element affected by the event-bubbeling.
    // To exclude elements with class "blocked" you could do the following (#73):
    return item.classList.contains('blocked');

    // If the areas you're using contains input elements you might want to prevent
    // any out-going selections from these elements (#72):
    return event.target.tagName !== 'INPUT';
  });
});
```

Issues: [#73](https://github.com/simonwep/viselect/issues/73)

## Preventing select from right click or more

This is now a default feature with the `triggers` option, see [API reference](./api-reference.md#selectionoptions)!

```js
selection.on('beforestart', (event) => {
  const allowedButtons = [
    // See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    1, // left click
    2, // right click
    4, // mouse wheel / middle button
  ];

  return allowedButtons.includes(event.event.buttons);
});
```

Issues: [#101](https://github.com/simonwep/viselect/issues/101)
