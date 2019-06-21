
module.exports = {
  pwa: {
    themeColor: '#fc7d7d',
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  }
}
