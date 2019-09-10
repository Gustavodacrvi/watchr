
module.exports = {
  pwa: {
    themeColor: '#242424',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'public/service-worker.js',
    },
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  }
}
