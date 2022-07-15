/*
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-06-13 15:39:43
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-07-15 16:06:34
 */
/*
model:{
  // 分组列表字段
  groupListKey:'groups',
  // 题列表字段
  questionListKey:'questions',
  // 请求参数:组id对应字段
  paramGroupIdKey:'questionGroupId',
  // 请求参数:题id对应字段
  paramQuestionIdKey:'paperQuestionId',
  // 请求参数:题ids对应字段
  paramQuestionIdsKey:'paperQuestionIds',
  childrenKey:'child'
}
*/
import { message } from '@/utils/overrideMessage'
import store from '@/store/index.js'
export default class GroupAction {
  constructor(operationData, storeType) {
    this.operationData = operationData
    this.dataModel = store.getters[storeType.DATAMODEL]
    this.storeType = storeType
    this.beforeDragData = null
  }
  // 更新操作数据
  updateOperationData(data) {
    this.operationData = data
  }
  // 获取移动参数
  getMovementParams() {
    if (this.operationData.sortType === 0) {
      return this.getMixMovementParams()
    } else {
      return this.getGroupMovementParams()
    }
  }
  // 获取移动组参数
  getGroupMovementParams() {
    let groupFormItems = []
    console.log('移动时用的数据:', this.operationData)
    for (
      let tindex = 0;
      tindex < this.operationData[this.dataModel.groupListKey].length;
      tindex++
    ) {
      let groupFormItem = {}
      const groupItem = this.operationData[this.dataModel.groupListKey][tindex]
      groupFormItem[this.dataModel.paramGroupIdKey] =
        groupItem[this.dataModel.groupIdKey]
      let idArray = []
      if (groupItem[this.dataModel.questionListKey].length > 0) {
        idArray = _.map(
          groupItem[this.dataModel.questionListKey],
          this.dataModel.paramQuestionIdKey
        )
      }
      groupFormItem[this.dataModel.paramQuestionIdsKey] = idArray
      groupFormItems.push(groupFormItem)
    }
    return groupFormItems
  }
  // 获取混合排序是移动参数
  getMixMovementParams() {
    let idArray = []
    for (
      let tindex = 0;
      tindex < this.operationData[this.dataModel.groupListKey].length;
      tindex++
    ) {
      let groupFormItem = {}
      const groupItem = this.operationData[this.dataModel.groupListKey][tindex]
      groupFormItem[this.dataModel.paramGroupIdKey] = console.log(
        'groupItem:',
        groupItem
      )
      groupItem[this.dataModel.groupIdKey]

      if (groupItem[this.dataModel.questionListKey].length > 0) {
        idArray = _.map(
          groupItem[this.dataModel.questionListKey],
          this.dataModel.paramQuestionIdKey
        )
      }
    }
    return idArray
  }
  // 点击题滚动到题
  doScroll(caller, questionString) {
    console.log('滚动到题:', questionString)
    console.log(caller)
    caller.$emit('scroll', questionString)
  }
  // 点击组滚动到组
  doScrollGroup(caller, groupString) {
    console.log('滚动到组')
    caller.$emit('scroll', groupString)
  }
  //滚动到底部
  doScrollToBottom(scroller, caller) {
    if (scroller) {
      let wrap = scroller.$children[0].$refs['wrap']
      caller.$nextTick(() => {
        wrap.scroll({ top: wrap.scrollHeight, behavior: 'smooth' })
      })
    }
  }
  async listenTypeDragEnd() {
    let forms = this.getMovementParams()
    let params = {
      questionGroupForms: forms,
      hwData: this.operationData
    }
    console.log('this.operationData:', this.operationData)
    try {
      console.log('storeType:', this.sortType)
      await store.dispatch(this.storeType.UPDATE_PAPER_ORDER, params)
      let operationData = store.getters[this.storeType.OPERATION_DATA]
      this.operationData = _.cloneDeep(operationData)
    } catch (error) {
      // 出现错误时还原
      this.operationData = _.cloneDeep(this.beforeDragData)
      message.error(`${error.message}`)
    }
  }
  // eslint-disable-next-line no-unused-vars
  async listenDragEnd(groupItem) {
    let forms = this.getMovementParams()
    let params = {
      questionGroupForms: forms,
      hwData: this.operationData
    }
    console.log('题组内移动题:', params)
    try {
      // this.updatePaperData(_.cloneDeep(this.copyPaperData))
      await store.dispatch(this.storeType.UPDATE_PAPER_ORDER, params)
      let operationData = store.getters[this.storeType.OPERATION_DATA]
      console.log('获取操作数据:', operationData)
      this.operationData = _.cloneDeep(operationData)
    } catch (error) {
      // 出现错误时还原
      this.operationData = _.cloneDeep(this.beforeDragData)
      message.error(`${error.message}`)
    }
  }
  listenDragStart() {
    // 保存拖拽前的数据
    console.log('保存数据')
    this.beforeDragData = _.cloneDeep(this.operationData)
  }

  getGrowStatus(qItem) {
    let isGrow = false
    // 小题大于等于10
    if (qItem[this.dataModel.childrenKey]?.length >= 10) {
      isGrow = true
      // 小空大于等于10
    } else if (qItem?.questionBlanks?.length >= 10) {
      isGrow = true
      // 题号大于1000
    } else if (qItem.no >= 1000) {
      isGrow = true
      // 小题显示一律为true
    } else if (qItem[this.dataModel.showChildKey]) {
      isGrow = true
    }
    return isGrow
  }
  isUnGroup(groupItem) {
    if (groupItem[this.dataModel.groupNamekey] === '未分组') {
      console.log('是未分组')
      return true
    } else {
      return false
    }
  }
  judgeGroupCount() {
    let isExistUnGroup = false
    let groups = this.operationData.groups
    if (groups?.length > 0) {
      let lastGroup = groups[groups.length - 1]
      if (lastGroup[this.dataModel.groupNamekey] === '未分组') {
        isExistUnGroup = true
      }
      let count = 0
      let totalCount = groups?.length ?? 0
      if (totalCount > 0) {
        if (isExistUnGroup) {
          count = groups?.length - 1
        } else {
          count = groups?.length
        }
      }
      return count
    } else {
      return 0
    }
  }
  judgeCanAdd() {
    let groupCount = this.judgeGroupCount()
    let canAddGroup = false
    console.log('groupCount:', groupCount)
    if (groupCount < 30) {
      canAddGroup = true
    } else {
      canAddGroup = false
    }
    return canAddGroup
  }
  getLastData() {
    return this.operationData
  }
}
