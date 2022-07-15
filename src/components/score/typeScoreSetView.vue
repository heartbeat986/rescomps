<!--
 * @Descripttion: 
 * @Version: 
 * @Author: jiaoxingxing
 * @Date: 2022-05-12 15:39:05
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-30 08:47:18
-->
<template>
  <div class="setting-container">
    <el-form ref="scoreForm" :model="{ datas, totalScore }">
      <div class="header">
        <div class="title-box">
          <label class="mark bold">分组标题:</label>
          <div class="input-box">
            <el-input
              v-model="typeTitle"
              class="small"
              placeholder=""
              :maxlength="20"
            ></el-input>
          </div>
        </div>
        <el-checkbox
          v-if="isShowAllCheckBox"
          v-model="isAllShowSubNo"
          :indeterminate="isAllIndeterminate"
          @change="listenChangeAllSubNoType"
          >全部按小题显示题号</el-checkbox
        >
      </div>
      <scroll-box ref="scrollRef" max-height="400px" min-height="100px">
        <div class="question-box">
          <div id="totalScore" class="total-box">
            <el-form-item prop="totalScore" :rules="checkTotalScore">
              <label class="mark">总分:</label>
              <div class="input-box">
                <el-input-number
                  v-model.number="totalScore"
                  controls-position="right"
                  placeholder=""
                  :step="0.5"
                  :step-strictly="true"
                  :min="0"
                  :max="500"
                  @input.native="listenTotalInput($event)"
                  @focus="listenFocus($event)"
                ></el-input-number>
                分
              </div>
              <button
                :disabled="!canTotalDivision"
                :class="{ disabled: !canTotalDivision }"
                class="btn border_btn level_2 round action-btn"
                @click.stop.prevent="doTotalEqualDivision"
              >
                平均分配
              </button>
            </el-form-item>
          </div>

          <div
            v-for="(item, index) in datas"
            :key="'item-' + index"
            class="question-item"
          >
            <div :id="`datas[${index}].score`" class="item--content">
              <el-form-item :prop="`datas[${index}].score`" :rules="checkScore">
                <label class="num">{{ item.no }}.</label>
                <div class="input-box">
                  <el-input-number
                    v-model.number="item.score"
                    controls-position="right"
                    placeholder=""
                    :step="0.5"
                    :step-strictly="true"
                    :min="0"
                    :max="100"
                    @input.native="listenInput($event, item)"
                    @change="listenChange(false, index)"
                    @focus="listenFocus($event)"
                  ></el-input-number>
                  分
                </div>
                <template
                  v-if="
                    item[action.dataModel.childrenKey] &&
                    item[action.dataModel.childrenKey].length > 1
                  "
                >
                  <button
                    :disabled="!item.canDivision"
                    :class="{
                      disabled: !item.canDivision
                    }"
                    class="btn border_btn level_2 round action-btn"
                    @click.stop.prevent="doEqualDivision(index)"
                  >
                    平均分配
                  </button>
                  <el-checkbox
                    v-model="item.childrenQuestionNumber"
                    label=""
                    @change="listenChangeSubNoType"
                    >按小题显示题号</el-checkbox
                  >
                </template>
                <template
                  v-else-if="
                    item.questionBlanks && item.questionBlanks.length > 1
                  "
                >
                  <button
                    :disabled="!item.canDivision"
                    :class="{
                      disabled: !item.canDivision
                    }"
                    class="btn border_btn level_2 round action-btn"
                    @click.stop.prevent="doEqualDivision(index)"
                  >
                    平均分配
                  </button>
                  <el-checkbox
                    v-model="item.childrenQuestionNumber"
                    label=""
                    @change="listenChangeSubNoType"
                    >按小题显示题号</el-checkbox
                  >
                </template>
              </el-form-item>
            </div>
            <div
              v-if="
                item[action.dataModel.childrenKey] &&
                item[action.dataModel.childrenKey].length > 0
              "
              class="sub-container"
            >
              <div
                v-for="(subItem, subIndex) in item[
                  action.dataModel.childrenKey
                ]"
                :key="'subItem-' + subIndex"
                class="item"
              >
                <div
                  :id="`datas[${index}].child[${subIndex}].score`"
                  class="item--content"
                >
                  <el-form-item
                    :prop="`datas[${index}].child[${subIndex}].score`"
                    :rules="checkScore"
                  >
                    <label class="num">{{ subItem.no }}.</label>
                    <div class="input-box">
                      <el-input-number
                        v-model.number="subItem.score"
                        controls-position="right"
                        placeholder=""
                        :step="0.5"
                        :step-strictly="true"
                        :min="0"
                        :max="100"
                        @input.native="listenInput($event, subItem)"
                        @change="listenChange(true, index)"
                        @focus="listenFocus($event)"
                      ></el-input-number>
                      分
                    </div>
                    <button
                      v-if="
                        subItem.questionBlanks &&
                        subItem.questionBlanks.length > 1
                      "
                      :disabled="!subItem.canDivision"
                      :class="{
                        disabled: !subItem.canDivision
                      }"
                      class="btn border_btn level_2 round action-btn"
                      @click.stop.prevent="
                        doEqualSubBlankDivision(index, subIndex)
                      "
                    >
                      平均分配
                    </button>
                  </el-form-item>
                </div>
                <div
                  v-if="
                    subItem.questionBlanks && subItem.questionBlanks.length > 0
                  "
                  class="sub-blank-container"
                >
                  <div
                    v-for="(
                      subItemBlank, subBlankIndex
                    ) in subItem.questionBlanks"
                    :key="'subItemBlank-' + subBlankIndex"
                    class="item"
                  >
                    <div class="item--content">
                      <label class="num">{{ subItemBlank.no }}.</label>
                      <div class="input-box">
                        <el-input-number
                          v-model.number="subItemBlank.score"
                          controls-position="right"
                          placeholder=""
                          :step="0.5"
                          :step-strictly="true"
                          :min="0"
                          :max="100"
                          @change="listenSubBlankChange(index, subIndex)"
                          @focus="listenFocus($event)"
                        ></el-input-number>
                        分
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-else-if="item.questionBlanks && item.questionBlanks.length > 0"
              class="sub-container"
            >
              <div
                v-for="(subItem, subIndex) in item.questionBlanks"
                :key="'subItem-' + subIndex"
                class="item"
              >
                <div class="item--content">
                  <label class="num">{{ subItem.no }}.</label>
                  <div class="input-box">
                    <el-input-number
                      v-model.number="subItem.score"
                      controls-position="right"
                      placeholder=""
                      :step="0.5"
                      :step-strictly="true"
                      :min="0"
                      :max="100"
                      @change="listenChange(true, index)"
                      @focus="listenFocus($event)"
                    ></el-input-number>
                    分
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </scroll-box>
    </el-form>
  </div>
</template>

<script>
import scrollBox from '@/components/common/scrollBox'
import { ScoreCalculateMixin } from '@/mixins/scoreCalculateMixin'
export default {
  name: 'TypeScoreSetView',
  components: { scrollBox },
  mixins: [ScoreCalculateMixin],
  props: {
    value: {
      type: String,
      default() {}
    },
    typeData: {
      type: Object,
      default() {
        return {}
      }
    },
    action: {
      type: Object,
      required: true,
      default() {
        return {}
      }
    }
  },
  data() {
    let checkTotalValidator = (rule, value, callback) => {
      if (this.typeData[this.action.dataModel.questionListKey].length > 0) {
        if (value == undefined) {
          callback(new Error('总分不能为空'))
          return
        }
        let totalScore = this.getTypeTotalScore(this.datas)
        console.log('totalScore:', totalScore, value)
        if (totalScore !== value) {
          callback(new Error('与子题总分不匹配,请修改'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    let checkScoreValidator = (rule, value, callback) => {
      if (value == undefined) {
        callback(new Error('不能为空'))
        return
      }
      console.log(rule)
      let reg = /datas\[(\d+)\](.child\[(\d+)\])?\.score/
      let ruleResult = reg.test(rule.field)
      if (ruleResult) {
        let index = RegExp.$1
        let subItemIndex = RegExp.$3
        console.log('index:', index)
        console.log('index3:', subItemIndex)
        if (subItemIndex === '') {
          // 遍历子,看与当前分数是否相同
          let descendantScore = this.getDescendantScore(index)
          if (descendantScore !== value) {
            callback(new Error('与子题总分不匹配,请修改'))
          } else {
            callback()
          }
        } else {
          let descendantScore = this.getSubBlankScore(
            index,
            subItemIndex,
            value
          )
          if (descendantScore !== value) {
            callback(new Error('与子空总分不匹配,请修改'))
          } else {
            callback()
          }
        }
      }
    }
    return {
      typeTitle: '',
      totalScore: 0,
      isAllShowSubNo: false,
      isAllIndeterminate: false,
      isShowAllCheckBox: false,
      datas: [],
      canTotalDivision: false,
      checkScore: [
        {
          validator: checkScoreValidator,
          // trigger: ['blur', 'change']
          trigger: []
        }
      ],
      checkTotalScore: [
        {
          validator: checkTotalValidator,
          trigger: []
        }
      ],
      checkCount: 0
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.setDataModel(this.action.dataModel)
    this.typeTitle = this.typeData[this.action.dataModel.groupNamekey]
    this.datas = this.typeData[this.action.dataModel.questionListKey]
    this.totalScore = this.typeData.typeScore
    if (this.totalScore) {
      this.canTotalDivision = true
    }
    let isAllChecked = this.datas.every((qItem) => {
      return qItem[this.action.dataModel.showChildKey]
    })
    this.isShowAllCheckBox = this.datas.some((qItem) => {
      return (
        qItem[this.action.dataModel.childrenKey]?.length > 0 ||
        qItem?.questionBlanks?.length > 0
      )
    })
    for (let index = 0; index < this.datas.length; index++) {
      const element = this.datas[index]
      if (
        element[this.action.dataModel.childrenKey]?.length > 1 ||
        element?.questionBlanks?.length > 1
      ) {
        this.checkCount++
      }
    }
    if (!isAllChecked) {
      let isOneChecked = this.datas.some((qItem) => {
        return qItem[this.action.dataModel.showChildKey]
      })
      if (isOneChecked) {
        this.isAllIndeterminate = true
      }
    } else {
      this.isAllShowSubNo = true
    }
    this.resetIndexNumber()
  },
  methods: {
    listenTotalInput(event) {
      let currentValue = Number(event.target.value)
      if (currentValue) {
        this.canTotalDivision = true
      } else {
        this.canTotalDivision = false
      }
    },
    listenInput(event, item) {
      let currentValue = Number(event.target.value)
      if (currentValue) {
        this.$set(item, 'canDivision', true)
      } else {
        this.$set(item, 'canDivision', false)
      }
    },
    listenChange(isSub, index, subIndex) {
      if (isSub) {
        let item = this.datas[index]
        let total = 0
        item[this.action.dataModel.childrenKey].forEach((subItem) => {
          total += subItem.score
        })
        item.score = total
        this.$set(this.datas, index, item)
        this.$refs.scoreForm.validateField(
          `datas[${index}].child[${subIndex}].score`
        )
      }
      this.calculateTotal()
    },
    listenSubBlankChange(index, subIndex) {
      let item = this.datas[index]
      let subItem = item[this.action.dataModel.childrenKey][subIndex]
      let total = 0
      subItem.questionBlanks.forEach((subBlankItem) => {
        total += subBlankItem.score
      })
      subItem.score = total
      item[this.action.dataModel.childrenKey][subIndex] = subItem
      this.$set(this.datas, index, item)
      this.listenChange(true, index, subIndex)
    },
    listenChangeAllSubNoType(isChecked) {
      this.datas = this.datas.map((qItem) => {
        qItem[this.action.dataModel.showChildKey] = isChecked
        return qItem
      })
      this.resetIndexNumber()
    },
    listenFocus(event) {
      event.currentTarget.select()
    },
    listenChangeSubNoType() {
      let count = 0
      for (let index = 0; index < this.datas.length; index++) {
        let qItem = this.datas[index]
        if (qItem[this.action.dataModel.showChildKey]) {
          count++
        }
      }
      if (count === 0) {
        this.isAllShowSubNo = false
        this.isAllIndeterminate = false
      } else if (count === this.checkCount) {
        this.isAllShowSubNo = true
        this.isAllIndeterminate = false
      } else {
        this.isAllShowSubNo = false
        this.isAllIndeterminate = true
      }
      this.resetIndexNumber()
    },
    doTotalEqualDivision() {
      // 求余
      if (this.totalScore && this.datas.length) {
        let datas = _.cloneDeep(this.datas)
        this.datas = this.divisionSub(datas, this.totalScore)
        this.$refs['scoreForm'].validateField('totalScore')
      }
    },
    divisionSub(items, score) {
      if (items && items.length > 0) {
        let remainder = score % items.length
        let targetNumber = score
        if (remainder > 0) {
          targetNumber = score - remainder
        }
        let n = +remainder / (items.length * 0.5)
        let equalScore = targetNumber / items.length
        let subItems = []
        if (String(n).indexOf('.') > -1) {
          for (let index = 0; index < items.length; index++) {
            let subItem = items[index]
            if (index === 0) {
              subItem['score'] = +equalScore + +remainder
            } else {
              subItem['score'] = +equalScore
            }
            let targetDatas = []
            let dataString = 'child'
            if (
              subItem[this.action.dataModel.childrenKey] &&
              subItem[this.action.dataModel.childrenKey].length > 0
            ) {
              targetDatas = subItem[this.action.dataModel.childrenKey]
              dataString = 'child'
            } else if (
              subItem?.questionBlanks &&
              subItem?.questionBlanks.length > 0
            ) {
              targetDatas = subItem.questionBlanks
              dataString = 'questionBlanks'
            }
            subItem[dataString] = this.divisionSub(targetDatas, subItem.score)
            subItems.push(subItem)
          }
        } else {
          for (let index = 0; index < items.length; index++) {
            let subItem = items[index]
            let targetDatas = []
            let dataString = [this.action.dataModel.childrenKey]
            if (
              subItem[this.action.dataModel.childrenKey] &&
              subItem[this.action.dataModel.childrenKey].length > 0
            ) {
              targetDatas = subItem[this.action.dataModel.childrenKey]
              dataString = [this.action.dataModel.childrenKey]
            } else if (
              subItem?.questionBlanks &&
              subItem?.questionBlanks.length > 0
            ) {
              targetDatas = subItem.questionBlanks
              dataString = 'questionBlanks'
            }
            subItem['score'] = +equalScore + n * 0.5
            subItem[dataString] = this.divisionSub(targetDatas, subItem.score)
            subItems.push(subItem)
          }
        }
        items = subItems
      }
      return items
    },
    doEqualSubBlankDivision(index, subIndex) {
      // 大题
      let item = this.datas[index]
      let subItem = { questionBlanks: [] }
      let datas = []
      let dataString = ''
      if (
        item[this.action.dataModel.childrenKey] &&
        item[this.action.dataModel.childrenKey].length > 0
      ) {
        dataString = [this.action.dataModel.childrenKey]
        // 小题
        subItem = item[this.action.dataModel.childrenKey][subIndex]
        datas = subItem.questionBlanks
      } else if (item?.questionBlanks && item?.questionBlanks.length > 0) {
        dataString = 'questionBlanks'
        // 小空
        subItem = item.questionBlanks[subIndex]
        datas = subItem.questionBlanks
      }
      if (subItem.score && datas && datas.length > 0) {
        let remainder = +subItem.score % datas.length
        let targetNumber = +subItem.score
        if (remainder > 0) {
          targetNumber = +subItem.score - remainder
        }
        // 判断余数是否能被个数与0.5的倍数整除
        let n = +remainder / (datas.length * 0.5)
        let equalScore = targetNumber / datas.length
        let grandBlanks = []
        if (String(n).indexOf('.') > -1) {
          for (let index = 0; index < datas.length; index++) {
            let grandSonBlank = datas[index]
            if (index === 0) {
              grandSonBlank['score'] = +equalScore + +remainder
            } else {
              grandSonBlank['score'] = +equalScore
            }
            grandBlanks.push(grandSonBlank)
          }
        } else {
          for (let index = 0; index < datas.length; index++) {
            let grandSonBlank = datas[index]
            grandSonBlank['score'] = +equalScore + n * 0.5
            grandBlanks.push(grandSonBlank)
          }
        }
        subItem.questionBlanks = grandBlanks
        item[dataString][subIndex] = subItem
        this.$set(this.datas, index, item)
        console.log('this.datas:', this.datas)
        this.calculateTotal()
        this.$refs.scoreForm.validateField(
          `datas[${index}].child[${subIndex}].score`
        )
        // this.$refs['scoreForm'].validate('totalScore')
      }
    },
    doEqualDivision(index) {
      let item = this.datas[index]
      let dataStrinig = 'child'
      let datas = []
      if (
        item[this.action.dataModel.childrenKey] &&
        item[this.action.dataModel.childrenKey].length > 0
      ) {
        datas = item[this.action.dataModel.childrenKey]
      } else if (item?.questionBlanks && item.questionBlanks.length > 0) {
        datas = item.questionBlanks
        dataStrinig = 'questionBlanks'
      }
      if (item.score && datas && datas.length > 0) {
        let remainder = +item.score % datas.length
        let targetNumber = +item.score
        if (remainder > 0) {
          targetNumber = +item.score - remainder
        }
        // 判断余数是否能被个数与0.5的倍数整除
        let n = +remainder / (datas.length * 0.5)
        let equalScore = targetNumber / datas.length
        let subItems = []
        if (String(n).indexOf('.') > -1) {
          for (let subIndex = 0; subIndex < datas.length; subIndex++) {
            let qItem = datas[subIndex]
            if (subIndex === 0) {
              qItem['score'] = +equalScore + +remainder
            } else {
              qItem['score'] = +equalScore
            }
            this.doEqualSubBlankDivision(index, subIndex)
            subItems.push(qItem)
          }
        } else {
          for (let subIndex = 0; subIndex < datas.length; subIndex++) {
            let qItem = datas[subIndex]
            qItem['score'] = +equalScore + n * 0.5
            this.doEqualSubBlankDivision(index, subIndex)
            subItems.push(qItem)
          }
        }
        item[dataStrinig] = subItems
        console.log('subItems:', subItems)
        console.log('item:', item)
        this.$set(this.datas, index, item)
        console.log('this.datas:', this.datas)
        this.$refs.scoreForm.validateField(`datas[${index}].score`)
        // this.$refs['scoreForm'].validate('totalScore')
      }
    },
    // 计算总分
    calculateTotal() {
      let total = 0
      this.datas.forEach((qItem) => {
        total = total + +qItem.score
      })
      console.log(total)
      this.totalScore = total
    },
    resetIndexNumber() {
      let firstItem = this.datas[0]
      console.log(firstItem)
      if (!firstItem) {
        return
      }
      let startNo = 0
      if (String(firstItem.no).indexOf('~') > -1) {
        let noArray = firstItem.no.split('~')
        startNo = +noArray[0]
      } else {
        startNo = +firstItem.no
      }
      console.log('startNo:', startNo)
      for (let index = 0; index < this.datas.length; index++) {
        let qItem = this.datas[index]
        if (
          (qItem[this.action.dataModel.childrenKey] &&
            qItem[this.action.dataModel.childrenKey].length > 1 &&
            qItem[this.action.dataModel.showChildKey]) ||
          (qItem?.questionBlanks &&
            qItem.questionBlanks.length > 1 &&
            qItem[this.action.dataModel.showChildKey])
        ) {
          let subItems = []
          let endIndex = 0
          let childs = []
          let dataString = this.action.dataModel.childrenKey
          if (qItem[this.action.dataModel.childrenKey].length > 0) {
            endIndex = qItem[this.action.dataModel.childrenKey].length - 1
            childs = qItem[this.action.dataModel.childrenKey]
          } else if (qItem.questionBlanks.length > 0) {
            endIndex = qItem.questionBlanks.length - 1
            childs = qItem.questionBlanks
            dataString = 'questionBlanks'
          }
          qItem.no = `${startNo}~${startNo + endIndex}`
          for (let subIndex = 0; subIndex < childs.length; subIndex++) {
            let subItem = childs[subIndex]
            console.log('startNo:', startNo)
            subItem.no = startNo + subIndex
            subItems.push(subItem)
          }
          if (subItems.length > 0) {
            startNo = subItems[subItems.length - 1]['no']
          }
          qItem[dataString] = subItems
          this.$set(this.datas, index, qItem)
        } else if (
          qItem[this.action.dataModel.childrenKey] &&
          qItem[this.action.dataModel.childrenKey].length > 0 &&
          !qItem[this.action.dataModel.showChildKey]
        ) {
          qItem.no = startNo
          let subItems = []
          for (
            let subIndex = 0;
            subIndex < qItem[this.action.dataModel.childrenKey].length;
            subIndex++
          ) {
            let subItem = qItem[this.action.dataModel.childrenKey][subIndex]
            subItem.no = '(' + (subIndex + 1) + ')'
            subItems.push(subItem)
          }
          qItem[this.action.dataModel.childrenKey] = subItems
          this.$set(this.datas, index, qItem)
        } else if (
          qItem?.questionBlanks &&
          qItem.questionBlanks.length > 0 &&
          !qItem[this.action.dataModel.showChildKey]
        ) {
          qItem.no = startNo
          let subItems = []
          for (
            let subIndex = 0;
            subIndex < qItem.questionBlanks.length;
            subIndex++
          ) {
            let subItem = qItem.questionBlanks[subIndex]
            subItem.no = '第' + (subIndex + 1) + '空'
            subItems.push(subItem)
          }
          qItem.questionBlanks = subItems
          this.$set(this.datas, index, qItem)
        } else {
          qItem.no = +startNo
        }
        startNo = +startNo + 1
      }
    },
    // 校验表单
    validateForm(func) {
      this.$refs['scoreForm'].validate(async (result, object) => {
        if (func) {
          func(result, object, {
            datas: this.datas,
            typeTitle: this.typeTitle,
            totalScore: this.totalScore
          })
        }
      })
    },
    // 滚动表单到错误位置
    scrollFromToError(errorItem) {
      if (this.$refs.scrollRef) {
        let wrap = this.$refs.scrollRef.$children[0].$refs['wrap']
        this.$nextTick(() => {
          wrap.scroll({
            top: errorItem.offsetTop,
            behavior: 'smooth'
          })
        })
      }
    }
  },
  // 计算总分
  calculateTotal() {
    let total = 0
    this.datas.forEach((qItem) => {
      total = total + +qItem.score
    })
    console.log(total)
    this.totalScore = total
  }
}
</script>

<style lang="scss" scoped>
.setting-container {
  /deep/ .el-input {
    height: 32px;
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
  }
  .header {
    margin-bottom: 20px;
    @include flex-row(space-between, center);
    .title-box {
      @include flex-row(flex-start, center);
      .mark {
        margin-right: 8px;
        &.bold {
          font-weight: bold;
        }
      }
      /deep/ .el-input {
        width: 200px;
      }
    }
  }
  .question-box {
    background-color: $fill_color_5;
    padding: 20px;
    box-sizing: border-box;
    /deep/ .el-form-item {
      margin-bottom: 10px;
      .el-form-item__content {
        line-height: 32px;
        @include flex-row(flex-start, center);
      }
    }
    .total-box {
      @include flex-row(flex-start, center);
      margin-bottom: 11px;
      .mark {
        font-weight: bold;
        font-size: 14px;
      }
      .tip {
        color: $font_color_4;
        margin-left: 8px;
      }
      /deep/ .input-box {
        margin-left: 8px;
        .el-input {
          margin-right: 4px;
        }
      }
    }
    .action-btn {
      margin-right: 16px;
      height: 28px;
      line-height: 28px;
    }
    .input-box {
      margin-right: 16px;
      /deep/ .el-input-number {
        width: 88px;
        height: 30px;
        .el-input-number__decrease {
          width: 20px;
          line-height: 14px;
          background-color: $fill_color_4;
        }
        .el-input-number__increase {
          width: 20px;
          line-height: 14px;
          background-color: $fill_color_4;
        }
        .el-input {
          height: 30px;
          line-height: 30px;
          .el-input__inner {
            padding-right: 20px;
            line-height: 30px;
            height: 30px;
            &:focus {
              color: $main_color;
            }
          }
        }
      }
    }
    .question-item {
      margin-left: 36px;
      .item--content {
        @include flex-row(flex-start, center);
        /deep/ .el-form-item {
          margin-bottom: 0px;
          .el-form-item__content {
            @include flex-row(flex-start, center);
            line-height: 32px;
          }
        }
        .num {
          color: $font_color_2;
          font-weight: bold;
          margin-right: 6px;
        }
      }
      .sub-container {
        padding-left: 21px;
        padding-top: 16px;
        .item + .item {
          margin-top: 13px;
        }
        .sub-blank-container {
          padding-left: 41px;
          padding-top: 13px;
        }
      }
      & + .question-item {
        margin-top: 22px;
      }
    }
  }
}
</style>
