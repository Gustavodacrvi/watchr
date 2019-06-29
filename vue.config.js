
module.exports = {
  pwa: {
    themeColor: '#fc7d7d',
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
