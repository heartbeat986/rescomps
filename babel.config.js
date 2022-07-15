/*
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-06-14 17:11:07
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-07-15 14:01:41
 */
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry', // or "usage"
        corejs: 3
      }
    ]
  ]
}
