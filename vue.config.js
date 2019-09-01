
module.exports = {
  pwa: {
    themeColor: '#83B7E2',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'public/service-worker.js',
    },
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
    config.module
    .rule('vue')
    .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.prettify = false
        return options
      })
  }
}
