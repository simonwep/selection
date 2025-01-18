## Contribution Guidelines

### Issue

* Make sure you're using the latest version, check [releases](https://github.com/simonwep/viselect/releases/tag/2.1.2) for that.
* [Use the search](https://github.com/simonwep/viselect/search?type=Issues), maybe there is already an answer.
* If not found, [create an issue](https://github.com/simonwep/viselect/issues/new), please don't forget to carefully describe it how to reproduce it / pay attention to the issue-template.

***

### Pull Request

* Pull requests only into the [master](https://github.com/simonwep/viselect/tree/master) branch.
* Make sure to use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/):
    - `docs: ` - for changes in the documentation.
    - `feat([package]): ` - for new features in the corresponding package.
    - `fix([package]): ` - for bug fixes in the corresponding package.
    - `refactor([package]): ` - for changes in the code that neither fixes a bug nor adds a feature.
    - `chore: ` - for changes in the build process or auxiliary tools.

***

### Working on the library

This project requires [pnpm](https://pnpm.io) and [node](https://nodejs.org/en/).

1. Fork this repo on [GitHub](https://github.com/simonwep/viselect).
2. Check out the master locally.
3. From your local repro run `pnpm install`.
4. Run `pnpm start dev` to start a dev server for all packages.

#### Working on the docs

This project uses [vitepress](https://vitepress.dev/) for the documentation.
Use the `docs:` commands to work on the documentation.
