
module.exports = {
  pwa: {
    themeColor: '#131313',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#131313',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'public/service-worker.js',
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
