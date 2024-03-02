module.exports = {
  presets: [
    '@vue/app',
  ],
  env: {
    test: {
      // we use `?inline` as an import query parameter to differentiate inline and other svg files
      // jest doesn't support this well and imports fail when running tests
      // this plugin strips query parameters in the test environment
      plugins: ['babel-plugin-import-remove-resource-query']
    }
  }
};
