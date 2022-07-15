<!--
 * @Descripttion: 
 * @Version: 
 * @Author: jiaoxingxing
 * @Date: 2022-05-11 08:58:39
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-25 13:35:39
-->
<template>
  <div class="setting-container">
    <div class="header">
      <div class="total-box">
        <label class="mark">试卷总分:</label>
        <div class="input-box">
          <el-input
            v-model="totalScore"
            class="small"
            :placeholder="paperScore"
            :disabled="true"
          ></el-input>
          <span>分</span>
        </div>
        <span class="tip">(试卷满分由系统自动统计)</span>
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
        <el-form ref="scoreForm" :model="{ datas }">
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
                    (item[action.dataModel.childrenKey] &&
                      item[action.dataModel.childrenKey].length > 0) ||
                    (item.questionBlanks && item.questionBlanks.length > 0)
                  "
                >
                  <button
                    class="btn border_btn level_2 round action-btn"
                    :disabled="!item.canDivision"
                    :class="{ disabled: !item.canDivision }"
                    @click.stop.prevent="doEqualDivision(index)"
                  >
                    平均分配
                  </button>
                  <el-checkbox
                    v-if="
                      item.child.length > 1 || item.questionBlanks.length > 1
                    "
                    v-model="item[action.dataModel.showChildKey]"
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
                        subItem.questionBlanks.length > 0
                      "
                      class="btn border_btn level_2 round action-btn"
                      :disabled="!subItem.canDivision"
                      :class="{ disabled: !subItem.canDivision }"
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
        </el-form>
      </div>
    </scroll-box>
  </div>
</template>

<script>
import { ScoreCalculateMixin } from '@/mixins/scoreCalculateMixin'
import ScrollBox from '@/components/common/scrollBox'
export default {
  name: 'PaperScoreSetView',
  components: { ScrollBox },
  mixins: [ScoreCalculateMixin],
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    },
    paperScore: {
      type: [Number, String],
      default() {
        return '0'
      }
    },
    checkCount: {
      type: Number,
      default() {
        return 0
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
    let checkScoreValidator = (rule, value, callback) => {
      console.log(value)
      if (value == undefined) {
        callback(new Error('不能为空'))
        return
      }
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
      totalScore: 0,
      isAllShowSubNo: false,
      isAllIndeterminate: false,
      isShowAllCheckBox: false,
      checkScore: [
        {
          validator: checkScoreValidator,
          trigger: []
        }
      ]
    }
  },
  computed: {
    datas: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {
    datas(val) {
      console.log('所有数据:', val)
    }
  },
  mounted() {
    this.setDataModel(this.action.dataModel)
    this.totalScore = this.paperScore
    this.initCheckStatus()
  },
  methods: {
    initCheckStatus() {
      let isAllChecked = this.datas.every((qItem) => {
        return qItem[this.action.dataModel.showChildKey]
      })
      this.isShowAllCheckBox = this.datas.some((qItem) => {
        return (
          qItem[this.action.dataModel.childrenKey]?.length > 0 ||
          qItem?.questionBlanks?.length > 0
        )
      })
      if (!isAllChecked) {
        let isOneChecked = this.datas.some((qItem) => {
          if (qItem[this.action.dataModel.showChildKey]) {
            if (
              qItem[this.dataModel.questinListKey] &&
              qItem[this.dataModel.questinListKey].length > 0
            ) {
              return true
            }
            if (qItem.questionBlanks && qItem.questionBlanks.length > 0) {
              return true
            }
          } else {
            return false
          }
        })
        if (isOneChecked) {
          this.isAllIndeterminate = true
        }
      } else {
        this.isAllShowSubNo = true
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
    listenChange(isSub, index) {
      let current = this.datas[index]
      console.log('current:', current)
      if (isSub) {
        let item = this.datas[index]
        let total = 0
        if (
          item[this.action.dataModel.childrenKey] &&
          item[this.action.dataModel.childrenKey].length > 0
        ) {
          item[this.action.dataModel.childrenKey].forEach((subItem) => {
            total += subItem.score
          })
          item.score = total
        } else if (item.questionBlanks && item.questionBlanks.length > 0) {
          item.questionBlanks.forEach((subItem) => {
            total += subItem.score
          })
          item.score = total
        }
        this.$set(this.datas, index, item)
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
      // this.calculateTotal()
      this.listenChange(true, index)
    },
    listenFocus(event) {
      event.currentTarget.select()
    },
    listenChangeAllSubNoType(isChecked) {
      this.datas = this.datas.map((qItem) => {
        qItem[this.action.dataModel.showChildKey] = isChecked
        return qItem
      })
      this.resetIndexNumber()
    },
    listenChangeSubNoType() {
      let count = 0
      for (let index = 0; index < this.datas.length; index++) {
        let qItem = this.datas[index]
        if (
          qItem[this.action.dataModel.showChildKey] &&
          (qItem[this.action.dataModel.childrenKey].length > 1 ||
            qItem.questionBlanks.length > 1)
        ) {
          count++
        }
      }
      console.log('listenChangeSubNoType:', this.checkCount)
      console.log('count:', count)
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
    doEqualSubBlankDivision(index, subIndex) {
      try {
        // 大题
        let item = this.datas[index]
        let subItem = { questionBlanks: [] }
        let datas = []
        let dataString = ''
        if (
          item[this.action.dataModel.childrenKey] &&
          item[this.action.dataModel.childrenKey].length > 0
        ) {
          dataString = 'child'
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
          let n = +remainder / (subItem.questionBlanks.length * 0.5)
          let equalScore = targetNumber / subItem.questionBlanks.length
          let grandBlanks = []
          if (String(n).indexOf('.') > -1) {
            for (
              let index = 0;
              index < subItem.questionBlanks.length;
              index++
            ) {
              let grandSonBlank = subItem.questionBlanks[index]
              if (index === 0) {
                grandSonBlank['score'] = +equalScore + +remainder
              } else {
                grandSonBlank['score'] = +equalScore
              }
              grandBlanks.push(grandSonBlank)
            }
          } else {
            for (
              let index = 0;
              index < subItem.questionBlanks.length;
              index++
            ) {
              let grandSonBlank = subItem.questionBlanks[index]
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
        }
      } catch (error) {
        this.$message.error(`${error.message}`)
      }
    },
    doEqualDivision(index) {
      let item = this.datas[index]
      let datas = []
      let dataString = ''
      if (
        item[this.action.dataModel.childrenKey] &&
        item[this.action.dataModel.childrenKey].length > 0
      ) {
        datas = item[this.action.dataModel.childrenKey]
        dataString = 'child'
      } else if (item?.questionBlanks && item?.questionBlanks.length > 0) {
        datas = item.questionBlanks
        dataString = 'questionBlanks'
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
        item[dataString] = subItems
        this.$set(this.datas, index, item)
        this.calculateTotal()
        this.$refs.scoreForm.validateField(`datas[${index}].score`)
      }
    },
    // 计算总分
    calculateTotal() {
      let total = 0
      this.datas.forEach((qItem) => {
        let count = qItem.score ?? 0
        total = total + +count
      })
      this.totalScore = total
    },
    // 重置序号
    resetIndexNumber() {
      let startNo = 0
      for (let index = 0; index < this.datas.length; index++) {
        let qItem = this.datas[index]
        startNo = startNo + 1
        if (
          qItem[this.action.dataModel.childrenKey]?.length > 1 &&
          qItem[this.action.dataModel.showChildKey]
        ) {
          let subItems = []
          let subBlanks = []
          qItem.no = `${startNo}~${
            startNo + qItem[this.action.dataModel.childrenKey].length - 1
          }`
          for (
            let subIndex = 0;
            subIndex < qItem[this.action.dataModel.childrenKey].length;
            subIndex++
          ) {
            let subItem = qItem[this.action.dataModel.childrenKey][subIndex]
            console.log('子题:', subItem, subIndex)
            subItem.no = startNo + subIndex
            subItems.push(subItem)
          }
          for (
            let subIndex = 0;
            subIndex < qItem.questionBlanks.length;
            subIndex++
          ) {
            let subItem = qItem.questionBlanks[subIndex]
            console.log('子题:', subItem, subIndex)
            subItem.no = startNo + subIndex
            subBlanks.push(subItem)
          }
          if (subItems.length > 0) {
            startNo = subItems[subItems.length - 1]['no']
            qItem[this.action.dataModel.childrenKey] = subItems
          }
          this.$set(this.datas, index, qItem)
        } else if (
          qItem?.questionBlanks?.length > 1 &&
          qItem[this.action.dataModel.showChildKey]
        ) {
          console.log('重新设置')
          let subBlanks = []
          qItem.no = `${startNo}~${startNo + qItem.questionBlanks.length - 1}`
          for (
            let subIndex = 0;
            subIndex < qItem.questionBlanks.length;
            subIndex++
          ) {
            let subItem = qItem.questionBlanks[subIndex]
            subItem.no = startNo + subIndex
            subBlanks.push(subItem)
          }
          if (subBlanks.length > 0) {
            startNo = subBlanks[subBlanks.length - 1]['no']
            qItem.questionBlanks = subBlanks
          }
          this.$set(this.datas, index, qItem)
        } else if (
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
            console.log('子题:', subItem, subIndex)
            subItem.no = '(' + (subIndex + 1) + ')'
            subItems.push(subItem)
          }
          qItem[this.action.dataModel.childrenKey] = subItems
          this.$set(this.datas, index, qItem)
        } else if (
          qItem?.questionBlanks.length > 0 &&
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
            console.log('子空:', subItem, subIndex)
            subItem.no = '第' + (subIndex + 1) + '空'
            subItems.push(subItem)
          }
          qItem.questionBlanks = subItems
          this.$set(this.datas, index, qItem)
        } else {
          qItem.no = startNo
        }
      }
    },
    // 校验表单
    validateForm(func) {
      this.$refs['scoreForm'].validate(async (result, object) => {
        if (func) {
          func(result, object, this.totalScore)
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
    .total-box {
      @include flex-row(flex-start, center);
      .mark {
        font-weight: bold;
      }
      .tip {
        color: $font_color_4;
        margin-left: 8px;
      }
      /deep/ .input-box {
        margin-left: 8px;
        .el-input {
          margin-right: 4px;
          width: 100px;
        }
      }
    }
  }
  .question-box {
    background-color: $fill_color_5;
    padding: 20px;
    box-sizing: border-box;
    .question-item {
      .num {
        color: $font_color_2;
        font-weight: bold;
        margin-right: 6px;
      }
      // /deep/ .el-form-item__content {
      //   line-height: auto;
      // }
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
      .item--content {
        @include flex-row(flex-start, center);
        /deep/ .el-form-item {
          margin-bottom: 0px;
          .el-form-item__content {
            @include flex-row(flex-start, center);
            line-height: 32px;
          }
        }

        .action-btn {
          margin-right: 16px;
          height: 28px;
          line-height: 28px;
        }
      }
      .sub-container {
        padding-left: 41px;
        .item {
          .sub-blank-container {
            padding-left: 41px;
            padding-top: 13px;
          }
        }
      }
      .sub-container {
        padding-left: 41px;
        padding-top: 16px;
        .item + .item {
          margin-top: 13px;
        }
      }
      & + .question-item {
        margin-top: 22px;
      }
    }
  }
}
</style>
