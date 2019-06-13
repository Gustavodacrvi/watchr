
module.exports = {
  pwa: {
    themeColor: '#A97CFC',
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  }
}
