
module.exports = {
  pwa: {
    themeColor: '#AF92F7',
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch')
  }
}
