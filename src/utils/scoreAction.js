/*
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-06-16 10:24:27
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-07-09 10:23:06
 */
/*
model:{
  // 内容的id
  idKey: 'exerciseId',
  // 组的id
  groupIdKey: 'exerciseGroupId',
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
  // 请求参数:空的id对应字段
  paramBlankIdKey:'exerciseBlankQuestionId',
  // 子空对应的id字段
  blankIdKey:'id',
  // 大小题字段
  showChildKey:'childrenQuestionNumber'
  // 子级字段
  childrenKey:'child',
  
}
*/
import { message } from '@/utils/overrideMessage'
export default class ScoreAction {
  constructor(store, storeType) {
    if (!storeType.DATAMODEL) {
      throw new Error('storeType error: 需要指定数据模型.')
    }
    this.store = store
    this.dataModel = store.getters[storeType.DATAMODEL]
    this.storeType = storeType
    this.datas = []
  }
  // 获取铺平数据
  getFlattenArray() {
    try {
      let qDatas = []
      let checkNumCount = 0
      let editData = this.store.getters[this.storeType.OPERATION_DATA]
      let data = _.cloneDeep(editData[this.dataModel.groupListKey])
      for (let tIndex = 0; tIndex < data.length; tIndex++) {
        let typeItem = data[tIndex]
        let typeQuestions = typeItem[this.dataModel.questionListKey]
        let buildQuestions = []
        let typeId = typeItem[this.dataModel.groupIdKey]
        for (let qIndex = 0; qIndex < typeQuestions.length; qIndex++) {
          let qItem = typeQuestions[qIndex]
          qItem.position = typeId
          buildQuestions.push(qItem)
          if (
            (qItem[this.dataModel?.childrenKey] &&
              qItem[this.dataModel?.childrenKey]?.length > 1) ||
            qItem.questionBlanks.length > 1
          ) {
            checkNumCount++
          }
        }
        qDatas = qDatas.concat(buildQuestions)
      }
      console.log('this.datas:', this.datas)
      this.datas = qDatas
      return { qDatas, checkNumCount }
    } catch (error) {
      message.error(`${error.message}`)
      this.datas = []
      return { qDatas: [], checkNumCount: 0 }
    }
  }

  // 把平面数组还原
  updateQuestionData() {
    let editData = this.store.getters[this.storeType.OPERATION_DATA]
    let list = _.cloneDeep(editData[this.dataModel.groupListKey])
    let paperData = _.cloneDeep(editData)
    let listData = _.cloneDeep(list)
    let typeItems = []
    console.log('listData:', listData)
    for (let gIndex = 0; gIndex < listData.length; gIndex++) {
      let typeItem = listData[gIndex]
      let positionString = typeItem[this.dataModel.groupIdKey]
      let qItems = this.datas.filter((qItem) => {
        return qItem.position === positionString
      })
      typeItem[this.dataModel.questionListKey] = _.cloneDeep(qItems)
      typeItems.push(_.cloneDeep(typeItem))
    }
    paperData[this.dataModel.groupListKey] = typeItems
    return { typeItems, paperData }
  }

  // 更新操作数据
  updateOperationData(data) {
    this.operationData = data
  }
  // 获取最新操作数据
  getLastData() {
    return this.operationData
  }
  getScoreParams(listData) {
    let formList = []
    for (let gIndex = 0; gIndex < listData.length; gIndex++) {
      const groupItem = listData[gIndex]
      formList = formList.concat(this.getTypeItemForms(groupItem))
    }
    return formList
  }
  doSettingScore(caller, paperId) {
    return new Promise((resolve) => {
      // 更新试卷数据
      try {
        let setView = caller.$refs.setView
        console.log('setView:', setView)
        if (setView) {
          setView.validateForm(async (result, object, totalScore) => {
            if (result) {
              let { typeItems, paperData } = this.updateQuestionData()
              console.log(typeItems, paperData)
              let questionScoreFormList = this.getScoreParams(typeItems)
              let params = {
                questionScoreFormList: questionScoreFormList,
                type: 0
              }
              params[this.dataModel.idKey] = paperId
              try {
                await this.store.dispatch(this.storeType.DO_SET_SCORE, {
                  params,
                  paperData
                })
                this.store.commit(
                  this.storeType.PAPER_UPDATE_SCORE_M,
                  totalScore
                )
                // 更新总分数
                resolve(true)
                message.success('设置成功')
                caller.dialogVisible = false
              } catch (error) {
                resolve(false)
                message.error(error.message)
              }
            } else {
              resolve(false)
              console.log(object)
              let keys = Object.keys(object)
              if (keys && keys.length > 0) {
                let firstKey = keys[0]
                console.log(firstKey)
                let errorItem = document.getElementById(firstKey)
                setView.scrollFromToError(errorItem)
              }
            }
          })
        }
      } catch (error) {
        resolve(false)
        message.error(`${error.message}`)
      }
    })
  }
  doSetTypeScore(caller, typeData) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // 更新试卷数据
      try {
        let setView = caller.$refs.setView
        if (setView) {
          setView.validateForm(async (result, validaError, setData) => {
            if (result) {
              let datas = setData.datas
              let paperData = this.updateData(setData, typeData)
              let questionScoreFormList = this.getTypeScoreParams(datas)
              let params = {
                questionScoreFormList: questionScoreFormList,
                type: 1
              }
              params[this.dataModel.idKey] =
                this.store.getters[this.storeType.OPERATION_DATA][
                  this.dataModel.idKey
                ]
              params[this.dataModel.groupIdKey] =
                typeData[this.dataModel.groupIdKey]
              params[this.dataModel.groupNamekey] = setData.typeTitle
              try {
                await this.store.dispatch(this.storeType.DO_SET_SCORE, {
                  params,
                  paperData
                })
                caller.dialogVisible = false
                message.success('设置成功')
                resolve(true)
              } catch (error) {
                resolve(false)
                message.error(error.message)
              }
            } else {
              resolve(false)
              console.log(validaError)
              let keys = Object.keys(validaError)
              if (keys && keys.length > 0) {
                let firstKey = keys[0]
                console.log(firstKey)
                let errorItem = document.getElementById(firstKey)
                console.log(errorItem.offsetTop)
                setView.scrollFromToError(errorItem)
              }
            }
          })
        }
      } catch (error) {
        resolve(false)
        message.error(`${error.message}`)
      }
    })
  }
  getTypeScoreParams(datas) {
    let groupItem = {}
    groupItem[this.dataModel.questionListKey] = datas
    return this.getTypeItemForms(groupItem)
  }
  updateData(setData, typeData) {
    console.log('setData:', setData)
    // let pdata = this.isReview ? this.reviewPaperData : this.paperData
    let paperData = _.cloneDeep(
      this.store.getters[this.storeType.OPERATION_DATA]
    )
    let targetType = null
    let targetIndex = -1
    for (
      let tIndex = 0;
      tIndex < paperData[this.dataModel.groupListKey].length;
      tIndex++
    ) {
      let type = paperData[this.dataModel.groupListKey][tIndex]
      if (
        type[this.dataModel.groupIdKey] === typeData[this.dataModel.groupIdKey]
      ) {
        type[this.dataModel.questionListKey] = _.cloneDeep(setData.datas)
        type[this.dataModel.groupNamekey] = setData.typeTitle
        type.typeScore = setData.totalScore
        targetType = type
        targetIndex = tIndex
        break
      }
    }
    if (targetType) {
      paperData[this.dataModel.groupListKey][targetIndex] = targetType
    }
    return paperData
  }
  getTypeItemForms(groupItem) {
    let typeQItems = []
    for (
      let qindex = 0;
      qindex < groupItem[this.dataModel.questionListKey].length;
      qindex++
    ) {
      const qItem = groupItem[this.dataModel.questionListKey][qindex]
      let formItem = {}
      formItem[this.dataModel.showChildKey] = qItem[this.dataModel.showChildKey]
      formItem[this.dataModel.paramQuestionIdKey] =
        qItem[this.dataModel.paramQuestionIdKey]
      formItem.questionBlankScoreForms = []
      formItem.score = qItem.score
      let childScoreForms = []
      let questionBlankScoreForms = []
      // 子类型
      // child代替children封装
      if (
        qItem[this.dataModel.childrenKey] &&
        qItem[this.dataModel.childrenKey].length > 0
      ) {
        for (
          let sindex = 0;
          sindex < qItem[this.dataModel.childrenKey].length;
          sindex++
        ) {
          let subItem = qItem[this.dataModel.childrenKey][sindex]
          let subItemChild = qItem[this.dataModel.childrenKey][sindex]
          let childFormItem = {}
          childFormItem[this.dataModel.paramQuestionIdKey] =
            subItemChild[this.dataModel.paramQuestionIdKey]
          childFormItem.score = subItem.score
          let blankScoreForms = []
          for (
            let bindex = 0;
            bindex < subItem.questionBlanks.length;
            bindex++
          ) {
            let blankItem = {}
            const subItemBlankItem = subItem.questionBlanks[bindex]
            blankItem[this.dataModel.paramBlankIdKey] =
              subItemBlankItem[this.dataModel.blankIdKey]
            blankItem.score = subItemBlankItem.score
            blankScoreForms.push(blankItem)
          }
          childFormItem.blankScoreForms = blankScoreForms
          childScoreForms.push(childFormItem)
        }
      } else if (qItem.questionBlanks.length > 0) {
        for (let bindex = 0; bindex < qItem.questionBlanks.length; bindex++) {
          let subBlankItem = qItem.questionBlanks[bindex]
          let childBlankFormItem = {}
          childBlankFormItem[this.dataModel.paramBlankIdKey] =
            subBlankItem[this.dataModel.blankIdKey]
          childBlankFormItem.score = subBlankItem.score
          questionBlankScoreForms.push(childBlankFormItem)
        }
      }
      formItem.childScoreForms = childScoreForms
      formItem.blankScoreForms = questionBlankScoreForms
      typeQItems.push(formItem)
    }
    return typeQItems
  }
}
