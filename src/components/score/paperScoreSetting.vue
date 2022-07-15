<!--
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-01-24 13:35:18
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-17 13:13:22
-->
<template>
  <tip-dialog v-model="dialogVisible" :type="2" title="试卷分数设置">
    <paper-score-set-view
      ref="setView"
      v-model="datas"
      :paper-score="paperScore"
      :check-count="checkNumCount"
      :action="scoreAction"
    ></paper-score-set-view>
    <template #footer>
      <button class="btn form-cancel_btn form-level1_infour" @click="doClose">
        取消
      </button>
      <loading-btn
        class-names="btn main_btn form-level1_infour"
        :action-func="doSettingScore"
      >
        <template #content>确定</template>
      </loading-btn>
    </template>
  </tip-dialog>
</template>

<script>
import tipDialog from '@/components/dialog/tipDialog'
import loadingBtn from '@/components/common/loadingBtn'
// import DisassembleReviewType from '@/store/type/disassembleReviewType'
// import { mapMutations, mapActions } from 'vuex'
import { ScoreCalculateMixin } from '@/mixins/scoreCalculateMixin'
import paperScoreSetView from './paperScoreSetView'
import ScoreAction from '@/utils/scoreAction'
export default {
  name: 'PaperScoreSetting',
  components: { tipDialog, loadingBtn, paperScoreSetView },
  mixins: [ScoreCalculateMixin],
  props: {
    value: {
      type: Boolean,
      default() {
        return false
      }
    },
    // 列表数据
    listData: {
      required: true,
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
    paperId: {
      type: [Number, String],
      default() {
        return ''
      }
    },
    paperData: {
      type: Object,
      default() {
        return {}
      }
    },
    storeType: {
      type: Function,
      required: true,
      default() {
        return {}
      }
    },
    isReview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      datas: [],
      checkNumCount: 0,
      scoreAction: null
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  watch: {},
  mounted() {
    this.initScoreAction()
    // this.getFlattenArray()
    let { qDatas, checkNumCount } = this.scoreAction.getFlattenArray()
    this.datas = qDatas
    this.checkNumCount = checkNumCount
  },
  methods: {
    // ...mapMutations({
    //   updateSocre: homeworkType.PAPER_UPDATE_SCORE_M
    // }),
    // ...mapActions({
    //   setScore: homeworkType.DO_SET_SCORE
    // }),
    initScoreAction() {
      this.scoreAction = new ScoreAction(
        // this.listData,
        // this.paperData,
        this.storeType
      )
    },
    // getFlattenArray() {
    //   try {
    //     let qDatas = []
    //     let data = _.cloneDeep(this.listData)
    //     for (let tIndex = 0; tIndex < data.length; tIndex++) {
    //       let typeItem = data[tIndex]
    //       let typeQuestions = typeItem.paperQuestions
    //       let buildQuestions = []
    //       let typeId = typeItem.id
    //       for (let qIndex = 0; qIndex < typeQuestions.length; qIndex++) {
    //         let qItem = typeQuestions[qIndex]
    //         qItem.position = typeId
    //         buildQuestions.push(qItem)
    //         if (qItem.child?.length > 1 || qItem.questionBlanks.length > 1) {
    //           this.checkNumCount++
    //         }
    //       }
    //       qDatas = qDatas.concat(buildQuestions)
    //     }
    //     this.datas = qDatas

    //     console.log(this.datas)
    //   } catch (error) {
    //     this.$message.error(`${error.message}`)
    //   }
    // },
    doClose() {
      this.dialogVisible = false
    },
    doSettingScore() {
      return this.scoreAction.doSettingScore(this, this.paperId)
    },
    // 把平面数组还原
    updateQuestionData() {
      let paperData = _.cloneDeep(this.paperData)
      let listData = _.cloneDeep(this.listData)
      let typeItems = []
      console.log('listData:', listData)
      for (let gIndex = 0; gIndex < listData.length; gIndex++) {
        let typeItem = listData[gIndex]
        let positionString = typeItem.id
        let qItems = this.datas.filter((qItem) => {
          return qItem.position === positionString
        })
        typeItem.paperQuestions = _.cloneDeep(qItems)
        typeItems.push(_.cloneDeep(typeItem))
      }
      paperData.questionGroups = typeItems
      return { typeItems, paperData }
    },
    // 获取参数
    getScoreParams(listData) {
      let formList = []
      for (let gIndex = 0; gIndex < listData.length; gIndex++) {
        const groupItem = listData[gIndex]
        let typeQItems = []
        for (
          let qindex = 0;
          qindex < groupItem.paperQuestions.length;
          qindex++
        ) {
          const qItem = groupItem.paperQuestions[qindex]
          let formItem = {}
          formItem.showChildQuestion = qItem.bitShowChildQuestion
          formItem.paperQuestionId = qItem.paperQuestionId
          formItem.questionBlankScoreForms = []
          formItem.score = qItem.score
          let childScoreForms = []
          let questionBlankScoreForms = []
          // 子类型
          // child代替children封装
          if (qItem.child && qItem.child.length > 0) {
            for (let sindex = 0; sindex < qItem.child.length; sindex++) {
              let subItem = qItem.child[sindex]
              let subItemChild = qItem.child[sindex]
              let childFormItem = {}
              childFormItem.paperQuestionId = subItemChild.paperQuestionId
              childFormItem.score = subItem.score
              let blankScoreForms = []
              for (
                let bindex = 0;
                bindex < subItem.questionBlanks.length;
                bindex++
              ) {
                let blankItem = {}
                const subItemBlankItem = subItem.questionBlanks[bindex]
                blankItem.paperBlankQuestionId =
                  subItemBlankItem.paperQuestionBlankId
                blankItem.score = subItemBlankItem.score
                blankScoreForms.push(blankItem)
              }
              childFormItem.blankScoreForms = blankScoreForms
              childScoreForms.push(childFormItem)
            }
          } else if (qItem.questionBlanks.length > 0) {
            for (
              let bindex = 0;
              bindex < qItem.questionBlanks.length;
              bindex++
            ) {
              let subBlankItem = qItem.questionBlanks[bindex]
              let childBlankFormItem = {}
              childBlankFormItem.paperBlankQuestionId =
                subBlankItem.paperQuestionBlankId
              childBlankFormItem.score = subBlankItem.score
              questionBlankScoreForms.push(childBlankFormItem)
            }
          }
          formItem.childScoreForms = childScoreForms
          formItem.blankScoreForms = questionBlankScoreForms
          typeQItems.push(formItem)
        }
        formList = formList.concat(typeQItems)
      }

      return formList
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
