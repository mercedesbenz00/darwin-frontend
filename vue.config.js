const webpack = require('webpack');
const { defineConfig } = require('@vue/cli-service');
const path = require('path')
const svgInlineLoader = path.resolve('loaders/svg-as-vue-component-loader.js')

module.exports = defineConfig({
  runtimeCompiler: true,
  assetsDir: 'static',
  pwa: {
    name: 'Darwin',
    themeColor: '#f4f5f6',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/service-worker/service-worker.js'
    },
    iconPaths: {
      faviconSVG: 'img/icons/v7_logo.svg',
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    }
  },
  configureWebpack: {
    module: {
      rules: [
        // this rule allows us to import things from pinia (relies on .mjs)
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        }
      ],
    },
    resolve: {
      alias: {
        '/static': path.resolve(__dirname, 'public/static')
      },
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify')
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      })
    ]
  },
  // this can be confusing.
  // the command `vue inspect` will output the resulting webpack config
  // use `vue inspect > example.js` to get a file
  chainWebpack: config => {
    config.module
      .rule('snippets')
      .test(/snippets\/(?!index)/)
      .set('type', 'asset/source')

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule.delete('type');
    svgRule.delete('generator');

    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-loader').loader('vue-loader').end()
      .use(svgInlineLoader).loader(svgInlineLoader).end()

    svgRule.oneOf('external')
      .exclude.add(/^(\/static\/)/).end()
      .set('type', 'asset')
      .set('generator',  { filename: 'assets/[name].[hash:8].[ext]' })

      config.module
        .rule('images')
        .set('type', 'asset/resource')
  },
  pluginOptions: {
    storybook: {
      allowedPlugins: ['sass', 'postcss']
    }
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "~@/assets/styles/global.darwin.scss";'
      },
      postcss: {
        postcssOptions: {
          plugins: (loader) => [
            require('css-mqpacker')({ sort: true }),
            require('autoprefixer')(),
            require('postcss-url')(),
            require('postcss-import')(),
            require('postcss-plugin-px2rem')({
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
              minPixelValue: 3
            })
          ]
        }
      }
    }
  }
})
