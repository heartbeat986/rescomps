/*
 * @Author: jiaoxingxing
 * @Date: 2021-08-28 16:07:05
 * @LastEditTime: 2022-07-09 10:18:41
 * @LastEditors: jiaoxingxing
 * @Description:
 * @FilePath: \jty-template-web\src\main.js
 */
import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'

import '@/styles/index.scss' // 公共css
import '@/styles/common.scss' // 公共css
import '@/styles/overclass.scss' // 公共css

import App from './App'
// import store from './store'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { message } from '@/utils/overrideMessage'
Vue.prototype.$message = message
Vue.use(ElementUI)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  // store,
  render: (h) => h(App)
})
