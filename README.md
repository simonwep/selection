<h3 align="center">
    <img alt="Logo" src="https://user-images.githubusercontent.com/30767528/103286800-5a83fa00-49e1-11eb-8091-ef895c6f8241.png" width="400"/>
</h3>

<h3 align="center">
    Visual dom-selection library 
</h3>

<p align="center">
    <a href="https://choosealicense.com/licenses/mit/"><img
        alt="License MIT"
        src="https://img.shields.io/badge/licence-MIT-ae15cc.svg"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-8115cc.svg">
    <a href="https://github.com/sponsors/Simonwep"><img
        alt="Support me"
        src="https://img.shields.io/badge/github-support-6a15cc.svg"></a>
    <a href="https://www.jsdelivr.com/package/npm/@viselect/vanilla"><img
        alt="jsdelivr hits"
        src="https://img.shields.io/jsdelivr/npm/hm/@viselect/vanilla"></a>
    <a href="https://github.com/Simonwep/selection/actions?query=workflow%3ACI"><img
        alt="Build Status"
        src="https://github.com/Simonwep/selection/workflows/CI/badge.svg"></a>
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/vanilla/lib/viselect.min.js?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@viselect/vanilla/lib/viselect.min.js?compression=brotli">
</p>

<p align="center">
    <a href="https://www.buymeacoffee.com/aVc3krbXQ" target="_blank">
        <img src="https://user-images.githubusercontent.com/30767528/63641973-9d301680-c6b7-11e9-9d29-2ad1da50fdce.png"></a>
    </a>
</p>

### Features 🤘
* 🌟 Modern bundle
* 🔩 Ultra tiny (only ~4kb)
* 👌 Simple usage
* ⚡ Highly optimized
* ✔ Zero dependencies
* 📱 Mobile / touch support
* 🖱 Vertical and horizontal scroll support

##### Coming soon ✨
* Vue wrapper
* Preact / React wrapper

### Getting started

Check out the documentation for the package you want to use:

* [@viselect/vanilla](packages/vanilla) - To be used with [plain JavaScript](http://vanilla-js.com/) / TypeScript without any framework.
* [@viselect/preact](packages/preact) - [Preact](https://preactjs.com/) wrapper.
* [@viselect/react](packages/react) - [React](https://reactjs.org/) wrapper.
* [@viselect/vue](packages/vue) -  [Vue3](https://v3.vuejs.org/) wrapper.
* @viselect/angular - TBA (planned).

> Check out [recipes](recipes.md) for commonly asked questions and how to solve them using the standart library!

### Browser support

This library will always have `currentYear - 1` as its target. For 2021 for example the target will be ES2020. It always provides both a `UMD` (`.js`) and `.mjs` version. If you want to support legacy browsers, please use the feature of your bundler to transpile dependencie. In case of webpack and babel (give [vite](https://vitejs.dev/) a try, it's awesome) you'll have to install corresponding plugins such as [babel-plugin-proposal-optional-chaining](https://babeljs.io/docs/en/babel-plugin-proposal-optional-chaining) and include the dependency from `node_modules` which is normally entirely excluded from being processed.

I do this to provide maximum flexibility and give those who target ESNext a chance to make full use of how this library is bundled. Everything else is just a matter of configuration :)
