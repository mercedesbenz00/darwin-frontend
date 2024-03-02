const isProduction = process.env.NODE_ENV === 'production'

const plugins = [
  require('css-mqpacker')({
    sort: true
  }),
  require('autoprefixer'),
  require('postcss-url'),
  require('postcss-import'),
]

plugins.push(require('postcss-plugin-px2rem')({
  rootValue: 16,
  unitPrecision: 5,
  propWhiteList: [],
  propBlackList: [
    'border',
    'border-width',
    'border-bottom',
    'border-top',
    'border-left',
    'border-right',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-left-radius',
    'border-bottom-right-radius',
  ],
  selectorBlackList: [],
  ignoreIdentifier: false,
  replace: true,
  mediaQuery: false,
  minPixelValue: 4
}))

module.exports = {
  plugins
}
