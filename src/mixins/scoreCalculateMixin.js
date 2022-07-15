/*
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-02-25 10:49:09
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-07-09 10:01:55
 */
export const ScoreCalculateMixin = {
  data() {
    return {
      dataModel: {
        childrenKey: 'children'
      }
    }
  },
  methods: {
    setDataModel(dataModel) {
      this.dataModel = dataModel
    },
    getTypeTotalScore(datas) {
      let score = 0
      for (let index = 0; index < datas.length; index++) {
        // let subScore = this.getDescendantScore(index)
        let qItem = this.datas[index]
        score += qItem.score
      }
      return score
    },
    getDescendantScore(index) {
      let allScore = 0
      let qItem = this.datas[index]
      if (
        qItem[this.dataModel.childrenKey] &&
        qItem[this.dataModel.childrenKey].length > 0
      ) {
        allScore = this.getChildScore(this.dataModel.childrenKey, qItem)
      } else if (qItem?.questionBlanks && qItem.questionBlanks.length > 0) {
        allScore = this.getChildScore('questionBlanks', qItem)
      } else {
        allScore = +qItem.score
      }
      return allScore
    },
    getSubBlankScore(index, subIndex, score) {
      let allScore = 0
      let qItem = this.datas[index]
      let subItem = qItem[this.dataModel.childrenKey][subIndex]
      if (subItem?.questionBlanks && subItem.questionBlanks.length > 0) {
        allScore = this.getChildScore('questionBlanks', subItem)
      } else {
        allScore = score
      }
      return allScore
    },
    getChildScore(dataString, targetItem) {
      let totalScore = 0
      let datas = targetItem[dataString]
      for (let index = 0; index < datas.length; index++) {
        const subItem = datas[index]
        totalScore = totalScore + +subItem.score
      }
      return totalScore
    }
  }
}
