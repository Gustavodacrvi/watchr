
module.exports = {
  pwa: {
    themeColor: '#fc7d7d',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'public/service-worker.js',
    },
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  }
}
