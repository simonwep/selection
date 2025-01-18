# Using Viselect as-is

## Installation

To use Viselect without a framework, install it's vanilla package with:

::: code-group

```sh [npm]
$ npm add -D @viselect/vanilla
```

```sh [pnpm]
$ pnpm add -D @viselect/vanilla
```

```sh [yarn]
$ yarn add -D @viselect/vanilla
```

:::

## Usage

As per our [quickstart](/pages/quickstart.md), you can use Viselect in your project by importing the `SelectionArea` class from the `@viselect/vanilla` package.
For all the options available, check the [API reference](../api-reference.md#selectionoptions).

::: tip
As already mentioned, it's recommended to start from here _even_ if you're using vue, react, preact or any other framework as the only difference is to take care of the instance creation and destruction.
:::

::: code-group

```ts [main.ts]
import { SelectionArea } from '@viselect/vanilla';
import './styles.css';

// Generate some divs to select later
[
  ['.container.blue', 33],
  ['.container.green', 33]
].forEach(([selector, items]) => {
  const container = document.querySelector(selector);

  for (let i = 0; i < items; i++) {
    container.appendChild(document.createElement('div'));
  }
});

// Instantiate the selection area
const selection = new SelectionArea({
  selectables: ['.container > div'], // Specifies the elements that can be selected
  boundaries: ['.container'], // Specifies the boundaries of each selection
}).on('start', ({ store, event }) => {
  if (!event.ctrlKey && !event.metaKey) {
    store.stored.forEach(el => el.classList.remove('selected'));
    selection.clearSelection();
  }
}).on('move', ({ store: { changed: { added, removed } } }) => {
  added.forEach(el => el.classList.add('selected'));
  removed.forEach(el => el.classList.remove('selected'));
});
```

```css [styles.css]
.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    border: 1px dashed #4f5276;
    border-radius: 15px;
    padding: 15px;
    margin: 15px 0;
    user-select: none;
}

.container div {
    height: 50px;
    width: 50px;
    margin: 3px;
    background: rgba(66, 68, 90, 0.075);
    border-radius: 10px;
    cursor: pointer;
}

.container.green div.selected {
    background: linear-gradient(45deg, #78b2ff, #218ad9);
}

.container.blue div.selected {
    background: linear-gradient(45deg, #9e91ef, #5c51b4);
}

.selection-area {
    background: rgba(46, 115, 252, 0.11);
    border: 1px solid rgba(98, 155, 255, 0.85);
    border-radius: 0.15em;
}
```

```html [index.html]
<div class="container blue"></div>
<div class="container green"></div>
```

:::
