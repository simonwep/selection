<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/123517467-622b0f80-d6a1-11eb-9bf3-abcb4928a89e.png" width="400"/>
</h3>

<h3 align="center">
    Visual dom-selection library 
</h3>

<p align="center">
    <a href="https://choosealicense.com/licenses/mit/"><img
        alt="License MIT"
        src="https://img.shields.io/badge/license-MIT-ae15cc.svg"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-8115cc.svg">
    <a href="https://github.com/sponsors/Simonwep"><img
        alt="Support me"
        src="https://img.shields.io/badge/github-support-6a15cc.svg"></a>
    <img alt="version" src="https://img.shields.io/github/lerna-json/v/Simonwep/selection?color=%233d24c9&label=version">
    <a href="https://www.buymeacoffee.com/aVc3krbXQ"><img
        alt="Buy me a coffee"
        src="https://img.shields.io/badge/%F0%9F%8D%BA-buy%20me%20a%20beer-%23FFDD00"></a>
    <a href="https://github.com/Simonwep/selection/actions?query=workflow%3ACI"><img
        alt="Build Status"
        src="https://github.com/Simonwep/selection/workflows/CI/badge.svg"></a>
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/vanilla/dist/viselect.umd.js?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/vanilla/dist/viselect.umd.js?compression=brotli">
    <a href="https://v3.vuejs.org"><img
        alt="Vue support"
        src="https://img.shields.io/badge/✔-vue-%2340B581"></a>
    <a href="https://preactjs.com/"><img
        alt="Preact support"
        src="https://img.shields.io/badge/✔-preact-%236337B1"></a>
    <a href="https://reactjs.org"><img
        alt="React support"
        src="https://img.shields.io/badge/✔-react-%2359D7FF"></a>
    <a href="https://svelte.dev"><img
        alt="Svelte support"
        src="https://img.shields.io/badge/%E2%9A%99-svelte-%23F83C00"></a>
</p>

### Features 🤘

* 🌟 Modern bundle
* 🔩 Ultra tiny (~4kb)
* 👌 Simple usage
* ⚡ Highly optimized
* ✔ Zero dependencies
* 📱 Mobile / touch support
* 🖱 Vertical and horizontal scroll support
* 💪 Hardened (over 3 years old and used in many apps)
* 🖼 Support for major frameworks (WIP)

### Getting started

Check out the documentation for the package you want to use:

* [@viselect/vanilla](packages/vanilla) ([demo](https://codesandbox.io/s/viselectvanilla-kt332?file=/src/main.ts)) - To be used with plain [JavaScript](http://vanilla-js.com/)
  or [TypeScript](https://www.typescriptlang.org/).
* [@viselect/preact](packages/preact) ([demo](https://codesandbox.io/s/viselectpreact-kjo9e?file=/src/app.tsx)) - [Preact](https://preactjs.com/) wrapper.
* [@viselect/react](packages/react) ([demo](https://codesandbox.io/s/viselectreact-sbn83?file=/src/App.tsx)) - [React](https://reactjs.org/) wrapper.
* [@viselect/vue](packages/vue) ([demo](https://codesandbox.io/s/viselectvue-x13g6?file=/src/App.vue)) - [Vue3](https://v3.vuejs.org/) wrapper.
* @viselect/lit - TBA (planned).
* @viselect/svelte - TBA (planned).
* @viselect/angular - TBA (planned).

> Check out [recipes](packages/vanilla/recipes.md) for commonly asked questions and how to solve them using the standart library!
> For information about events and more check out the [vanilla readme](packages/vanilla/README.md)!

### Browser support

This library will always have the previous year as its target. For 2021 for example the target will be ES2020.
It always provides both a `UMD` (`.js`) and `.mjs` version. If you want to support legacy browsers, please use the feature of your bundler to transpile dependencie. In case of
webpack and babel (give [vite](https://vitejs.dev/) a try, it's awesome) you'll have to install corresponding plugins such
as [babel-plugin-proposal-optional-chaining](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining) and include the dependency from `node_modules` which is normally
entirely excluded from being processed.

I do this to provide maximum flexibility and give those who target ESNext a chance to make full use of how this library is bundled.
Everything else is just a matter of configuration :)

### Is this library the right choice for me?

Viselect primarily focuses on being a high-performant engine to select elements with various boundaries, behaviours and modes in your browser.
Viselect is to "full-blown libraries" what is [popper.js](https://popper.js.org/) to [tippy.js](https://atomiks.github.io/tippyjs/) - the _core_ of your feature / of another
library.

### Development

Use the following commands to work on this locally (we use [lerna](https://lerna.js.org/) to manage this):

* `npm run dev` _- Spawns a dev-server for all packages. Every framework-dependend package is bundled with the vanilla version._
* `npm run build` _- Builds all packages in parallel._
* `npm run lint:fix` _- Lints and fixes all errors in all packages._

For the development servers [vite](https://vitejs.dev/) is used. It's superb, you should give it a try.
To bundle it we use [rollup](https://rollupjs.org/) (which is btw also used by vite behind the scenes) to have full control over how the bundle looks like.

### Releasing a new version

This project is managed via [lerna](https://lerna.js.org/).
To bump the version and publish a new one run the following commands:

* `lerna version`
* `lerna publish from-package`

### You want to contribute?

That's awesome! Check out the [contribution guidelines](./.github/CONTRIBUTING.md) to get started :)
