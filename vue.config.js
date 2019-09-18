const SvgSpriteLoader = require('svg-sprite-loader')

module.exports = {
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
  }
}

/* 
            test: /\.(svg)$/,
            loader: "svg-sprite-loader",
            include: path.join( __dirname, "app/icons/svg/" ),
            options: {
                symbolId: "app-icon-[name]"
            }
 */
