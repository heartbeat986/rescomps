<!--
 * @Descripttion: 
 * @Version: 
 * @Author: jiaoxingxing
 * @Date: 2022-05-13 13:59:00
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-02 15:28:12
-->
<template>
  <div class="setting-container">
    <el-form ref="scoreForm" :model="{ data }">
      <scroll-box ref="scrollRef" max-height="400px" min-height="100px">
        <div class="question-box">
          <div class="question-item">
            <div id="data.score" class="item--content">
              <el-form-item prop="data.score" :rules="checkQuestionScore">
                <label class="num">{{ data.no }}.</label>
                <div class="input-box">
                  <el-input-number
                    v-model.number="data.score"
                    controls-position="right"
                    placeholder=""
                    :step="0.5"
                    :step-strictly="true"
                    :min="0"
                    :max="100"
                    @input.native="listenInput($event, data)"
                    @change="listenChange(false)"
                    @focus="listenFocus($event)"
                  ></el-input-number>
                  分
                </div>
                <template v-if="data.child && data.child.length > 1">
                  <button
                    :disabled="!data.canDivision"
                    :class="{
                      disabled: !data.canDivision
                    }"
                    class="btn border_btn level_2 round action-btn"
                    @click.stop.prevent="doEqualDivision"
                  >
                    平均分配
                  </button>
                  <el-checkbox
                    v-model="data.bitShowChildQuestion"
                    label=""
                    @change="listenChangeSubNoType"
                    >按小题显示题号</el-checkbox
                  >
                </template>
                <template
                  v-else-if="
                    data.questionBlanks && data.questionBlanks.length > 1
                  "
                >
                  <button
                    :disabled="!data.canDivision"
                    :class="{
                      disabled: !data.canDivision
                    }"
                    class="btn border_btn level_2 round action-btn"
                    @click.stop.prevent="doEqualDivision"
                  >
                    平均分配
                  </button>
                  <el-checkbox
                    v-model="data.bitShowChildQuestion"
                    label=""
                    @change="listenChangeSubNoType"
                    >按小题显示题号</el-checkbox
                  >
                </template>
              </el-form-item>
            </div>
            <div
              v-if="data.child && data.child.length > 0"
              class="sub-container"
            >
              <div
                v-for="(subItem, subIndex) in data.child"
                :key="'subItem-' + subIndex"
                class="item"
              >
                <div
                  :id="`data.child[${subIndex}].score`"
                  class="item--content"
                >
                  <el-form-item
                    :prop="`data.child[${subIndex}].score`"
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
                        @change="listenChange(true, subIndex)"
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
                      @click.stop.prevent="doEqualSubBlankDivision(subIndex)"
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
                          @change="listenSubBlankChange(subIndex)"
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
              v-else-if="data.questionBlanks && data.questionBlanks.length > 0"
              class="sub-container"
            >
              <div
                v-for="(subItem, subIndex) in data.questionBlanks"
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
                      @change="listenChange(true, subIndex)"
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
  name: 'QuestionSetView',
  components: { scrollBox },
  mixins: [ScoreCalculateMixin],
  props: {
    value: {
      type: String,
      default() {}
    },
    questionData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    let checkQuestionScoreValidator = (rule, value, callback) => {
      if (value == undefined) {
        callback(new Error('分数不能为空'))
        return
      }
      let totalScore = this.getDescendantScoreByData()
      console.log('totalScore:', totalScore, value)
      if (totalScore !== value) {
        callback(new Error('与子题总分不匹配,请修改'))
      } else {
        console.log('通过')
        callback()
      }
    }
    let checkScoreValidator = (rule, value, callback) => {
      if (value == undefined) {
        callback(new Error('不能为空'))
        return
      }
      console.log(rule)
      let reg = /data(.child\[(\d+)\])?\.score/
      let ruleResult = reg.test(rule.field)
      if (ruleResult) {
        let subItemIndex = RegExp.$2
        console.log('index2:', subItemIndex)
        if (subItemIndex === '') {
          // 遍历子,看与当前分数是否相同
          let descendantScore = this.getDescendantScoreByData()
          if (descendantScore !== value) {
            callback(new Error('与子题总分不匹配,请修改'))
          } else {
            callback()
          }
        } else {
          let descendantScore = this.getSubBlankScoreByData(
            Number(subItemIndex),
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
      score: 0,
      data: {},
      canTotalDivision: false,
      checkScore: [
        {
          validator: checkScoreValidator,
          // trigger: ['blur', 'change']
          trigger: []
        }
      ],
      checkQuestionScore: [
        {
          validator: checkQuestionScoreValidator,
          trigger: []
        }
      ]
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.data = _.cloneDeep(this.questionData)
    this.score = this.data.score
    if (this.score) {
      this.canTotalDivision = true
    }
    // let isAllChecked = this.data.bitShowChildQuestion
    // this.isShowAllCheckBox = this.datas.some((qItem) => {
    //   return qItem?.children?.length > 0 || qItem?.questionBlanks?.length > 0
    // })
    // if (!isAllChecked) {
    //   let isOneChecked = this.datas.some((qItem) => {
    //     return qItem.bitShowChildQuestion
    //   })
    //   if (isOneChecked) {
    //     this.isAllIndeterminate = true
    //   }
    // } else {
    //   this.isAllShowSubNo = true
    // }
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
    listenChange(isSub, subIndex) {
      if (isSub) {
        let item = this.data
        let total = 0
        item.child.forEach((subItem) => {
          total += subItem.score ?? 0
        })
        item.score = total
        this.$refs['scoreForm'].validateField(`data.child[${subIndex}].score`)
      }
      this.calculateTotal()
    },
    listenSubBlankChange(subIndex) {
      let subItem = this.data.child[subIndex]
      let total = 0
      subItem.questionBlanks.forEach((subBlankItem) => {
        total += subBlankItem.score
      })
      subItem.score = total
      subItem.child[subIndex] = subItem
      this.listenChange(true, subIndex)
    },
    listenChangeAllSubNoType(isChecked) {
      this.datas = this.datas.map((qItem) => {
        qItem.bitShowChildQuestion = isChecked
        return qItem
      })
      this.resetIndexNumber()
    },
    listenFocus(event) {
      event.currentTarget.select()
    },
    listenChangeSubNoType() {
      this.resetIndexNumber()
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
            if (subItem?.child && subItem?.child.length > 0) {
              targetDatas = subItem.child
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
            let dataString = 'child'
            if (subItem?.child && subItem?.child.length > 0) {
              targetDatas = subItem.child
              dataString = 'child'
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
    doEqualSubBlankDivision(subIndex) {
      let item = this.data
      let subItem = { questionBlanks: [] }
      let datas = []
      let dataString = ''
      if (item?.child && item?.child.length > 0) {
        dataString = 'child'
        // 小题
        subItem = item.child[subIndex]
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
        console.log('this.datas:', this.datas)
        this.calculateTotal()
        this.$refs.scoreForm.validateField(`data.child[${subIndex}].score`)
        // this.$refs['scoreForm'].validateField('data.score')
      }
    },
    doEqualDivision() {
      let item = this.data
      let dataStrinig = 'child'
      let datas = []
      if (item?.child && item.child.length > 0) {
        datas = item.child
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
          for (let index = 0; index < datas.length; index++) {
            let qItem = datas[index]
            if (index === 0) {
              qItem['score'] = +equalScore + +remainder
            } else {
              qItem['score'] = +equalScore
            }
            this.doEqualSubBlankDivision(index)
            subItems.push(qItem)
          }
        } else {
          for (let index = 0; index < datas.length; index++) {
            let qItem = datas[index]
            qItem['score'] = +equalScore + n * 0.5
            this.doEqualSubBlankDivision(index)
            subItems.push(qItem)
          }
        }
        item[dataStrinig] = subItems
        console.log('subItems:', subItems)
        console.log('item:', item)
        // this.$set(this.datas, index, item)
        console.log('this.datas:', this.datas)
        this.$refs['scoreForm'].validate()
      }
    },
    // 校验表单
    validateForm(func) {
      this.$refs['scoreForm'].validate((result, object) => {
        console.log('object:', object)
        if (func) {
          func(result, object, {
            data: this.data,
            totalScore: this.score
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
    },
    // 计算总分
    calculateTotal() {
      this.score = this.data.score
    },
    // 重置序号
    resetIndexNumber() {
      let firstItem = this.data
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
      let qItem = firstItem
      if (
        (qItem?.child &&
          qItem.child.length > 1 &&
          qItem.bitShowChildQuestion) ||
        (qItem?.questionBlanks &&
          qItem.questionBlanks.length > 1 &&
          qItem.bitShowChildQuestion)
      ) {
        let subItems = []
        let endIndex = 0
        let childs = []
        let dataString = 'child'
        if (qItem.child.length > 0) {
          endIndex = qItem.child.length - 1
          childs = qItem.child
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
      } else if (
        qItem?.child &&
        qItem.child.length > 0 &&
        !qItem.bitShowChildQuestion
      ) {
        qItem.no = startNo
        let subItems = []
        for (let subIndex = 0; subIndex < qItem.child.length; subIndex++) {
          let subItem = qItem.child[subIndex]
          subItem.no = '(' + (subIndex + 1) + ')'
          subItems.push(subItem)
        }
        qItem.child = subItems
      } else if (
        qItem?.questionBlanks &&
        qItem.questionBlanks.length > 0 &&
        !qItem.bitShowChildQuestion
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
      } else {
        qItem.no = +startNo
      }
      startNo = +startNo + 1
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
