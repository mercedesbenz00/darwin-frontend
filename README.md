# Darwin Frontend

> Annotation tool for AI

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run serve

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run jest unit tests
npm run test:unit

# run jest unit tests in watch mode
npm run test:watch

# run e2e tests
See [writing e2e tests](./test/WRITING_TESTS.md).
```

For a detailed explanation on how things work, check out the
[guide](http://vuejs-templates.github.io/webpack/) and
[docs for vue-loader](http://vuejs.github.io/vue-loader).

## Serving assets

You can start up an asset server using `python3` in the `src/assets` directory:

```bash
cd src/assets/ && python3 -m http.server 8080
```

## Developing components with storybook

- Add a `ComponentName.stories.ts` into the same folder the component is in
- Run `npm run serve:storybook`

Note that storybook was added as a vue-cli plugin. Some values in `vue-config.js`
might affect it.

## Upgrading test packages

The library `vue-jest`, which is something we cannot avoid using, requires
`jest > 24 & < 27`. Attempting to override that will break the test build.

Additionally, using `babel-jest > 24.9.0` introduces issue with any test module
which might be relying on `jest.mock`.

Due to this
- we cannot upgrade jest to 27.x.x
- we cannot upgrade babel-jest past 24.9.0. The most recent "compatible"
  release, 26.x.x is still broken.

Ideally, we should strive to be on the same major version (27.x.x) so any
further upgrades should wait until that is released

## NOTE on dependencies

### UML Diagrams

There are UML diagrams with the .plantuml extension sprinkled throughout the code.
It is encouraged to use these where it makes sense, especially with workview tools.

To learn how to write them, visit the [PlantUML Website](https://plantuml.com/).

VSCode has an extension which supports previewing them. It's called `PlantUML` and has been included in repo-suggested extensions.

Simple ones can be previewed using the official webserver. `settings.json` 
for the workspace already has the settings required to preview them this way.
