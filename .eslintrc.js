/*
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-06-14 17:11:07
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-30 09:50:44
 */
// .eslintrc.js
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    // 定义ESLint的解析器
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  // 指定代码的运行环境
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    //继承 vue 的标准特性
    'plugin:vue/recommended',
    'eslint:recommended',
    //避免与 prettier 冲突
    'plugin:prettier/recommended'
  ],
  plugins: ['vue', 'prettier'],
  //当使用第三方的SDK时，eslint会报找不到，可以加入到globals，取消对这个的检查,'_'
  globals: {
    _: true
  },
  rules: {
    'vue/script-setup-uses-vars': 'off'
  }
}
