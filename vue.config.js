/*
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-06-14 17:11:07
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-14 17:15:38
 */
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")

const webpack = require('webpack')
const path = require('path')
const resolve = (dir) => path.join(__dirname, dir)

module.exports = {
  outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: 'static', // 相对于outputDir的静态资源(js、css、img、fonts)目录
  configureWebpack: {
    devtool: 'cheap-module-source-map'
  },
  chainWebpack: (config) => {
    // 修复 HMR(热更新)失效
    config.resolve.symlinks(true)
    config
      .plugin('ignore')
      .use(new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn$/)) // 删除 moment 除 zh-cn 中文包外的其它语言包，无需在代码中手动引入 zh-cn 语言包。

    // 添加别名
    config.resolve.alias
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
    config.plugin('provide').use(webpack.ProvidePlugin, [
      {
        $: 'jquery',
        _: 'lodash',
        jquery: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }
    ])
    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [{ prefixIds: true }, { removeViewBox: false }]
        }
      })
    return config
  },
  // 全局设置scss 变量
  css: {
    extract: true,
    sourceMap: false,
    loaderOptions: {
      scss: {
        // 向全局sass样式传入共享的全局变量, $src可以配置图片cdn前缀
        // 详情: https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
        prependData: '@import "@/styles/mixin.scss";'
      }
    }
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false, // 生产环境的 source map
  parallel: require('os').cpus().length > 1,
  pwa: {}
}
