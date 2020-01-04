
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  pwa: {
    themeColor: '#1c1c1c',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#131313',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'public/service-worker.js',
    },
  },
  configureWebpack: {
    plugins: [
      new MomentLocalesPlugin({
        localesToKeep: ['pt-br'],
      }),
      new VuetifyLoaderPlugin(),
    ],
    resolve: {
      alias: {
        moment: 'moment/src/moment',
      },
    },
  },
  chainWebpack: config => {
    config.plugins.delete('prefetch')
    
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
  }
}
