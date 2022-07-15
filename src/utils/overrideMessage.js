import { Message } from 'element-ui'

// 默认配置
const deafultOptions = {
  duration: 1000
}
const showMessage = Symbol('showMessage')
let messageInstance = null

/**
 * 自定义 Message 类
 *
 * 参数
 * options: String || Object
 * single:  Boolean
 *
 * 例如：
 * this.$message.type(options)
 * this.$message.success('收藏成功')
 * this.$message.success({message: '收藏成功', duration: 1000})
 * this.$message.success('操作成功', false)
 */

class CusMessage {
  [showMessage](type, options, single) {
    if (messageInstance && single) {
      messageInstance.close()
    }

    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    messageInstance = Message[type](Object.assign({}, deafultOptions, options))
  }
  info(options, single = true) {
    this[showMessage]('info', options, single)
  }
  warning(options, single = true) {
    this[showMessage]('warning', options, single)
  }
  error(options, single = true) {
    console.log('aaa')
    this[showMessage]('error', options, single)
  }
  success(options, single = true) {
    this[showMessage]('success', options, single)
  }
}

export const message = new CusMessage()
