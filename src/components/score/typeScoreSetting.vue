<!--
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-01-24 13:35:18
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-16 17:09:54
-->
<template>
  <tip-dialog v-model="dialogVisible" :type="2" title="分数设置">
    <type-score-set-view
      ref="setView"
      :type-data="typeData"
      :action="scoreAction"
    ></type-score-set-view>
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
// import paperEditType from '@/store/type/paperEditType'
// import { mapGetters, mapActions } from 'vuex'
import { ScoreCalculateMixin } from '@/mixins/scoreCalculateMixin'
import typeScoreSetView from './typeScoreSetView'
import ScoreAction from '@/utils/scoreAction'
export default {
  name: 'TypeScoreSetting',
  components: { tipDialog, loadingBtn, typeScoreSetView },
  mixins: [ScoreCalculateMixin],
  props: {
    value: {
      type: Boolean,
      default() {
        return false
      }
    },
    typeData: {
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
      scoreAction: {}
    }
  },
  computed: {
    // ...mapGetters(['paperData', 'reviewPaperData', 'paperId', 'reviewPaperId']),
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
    this.scoreAction = new ScoreAction(this.storeType)
  },
  methods: {
    // ...mapActions({
    // setScore: homeworkType.DO_SET_SCORE
    // reviewSetScore: homeworkType.DO_SET_SCORE
    // }),
    doClose() {
      this.dialogVisible = false
    },
    doSettingScore() {
      return this.scoreAction.doSetTypeScore(this, this.typeData)
      // eslint-disable-next-line no-async-promise-executor
      // return new Promise(async (resolve) => {
      //   // 更新试卷数据
      //   try {
      //     let setView = this.$refs.setView
      //     if (setView) {
      //       setView.validateForm(async (result, validaError, setData) => {
      //         if (result) {
      //           this.datas = setData.datas
      //           let paperData = this.updateData(setData)
      //           let questionScoreFormList = this.getScoreParams()
      //           let paperId = this.isReview ? this.reviewPaperId : this.paperId
      //           let params = {
      //             paperId: paperId,
      //             paperQuestionGroupId: this.typeData.id,
      //             paperQuestionGroupName: setData.typeTitle,
      //             questionScoreFormList: questionScoreFormList,
      //             type: 1
      //           }
      //           try {
      //             if (this.isReview) {
      //               await this.reviewSetScore({ params, paperData })
      //             } else {
      //               await this.setScore({ params, paperData })
      //             }
      //             this.dialogVisible = false
      //             this.$message.success('设置成功')
      //             resolve(true)
      //           } catch (error) {
      //             resolve(false)
      //             this.$message.error(error.message)
      //           }
      //         } else {
      //           resolve(false)
      //           console.log(validaError)
      //           let keys = Object.keys(validaError)
      //           if (keys && keys.length > 0) {
      //             let firstKey = keys[0]
      //             console.log(firstKey)
      //             let errorItem = document.getElementById(firstKey)
      //             console.log(errorItem.offsetTop)
      //             setView.scrollFromToError(errorItem)
      //           }
      //         }
      //       })
      //     }
      //   } catch (error) {
      //     resolve(false)
      //     this.$message.error(`${error.message}`)
      //   }
      // })
    },
    updateData(setData) {
      console.log('setData:', setData)
      let pdata = this.isReview ? this.reviewPaperData : this.paperData
      let paperData = _.cloneDeep(pdata)
      let targetType = null
      let targetIndex = -1
      for (let tIndex = 0; tIndex < paperData.questionGroups.length; tIndex++) {
        let type = paperData.questionGroups[tIndex]
        if (type.id === this.typeData.id) {
          type.paperQuestions = _.cloneDeep(setData.datas)
          type.questionGroupName = setData.typeTitle
          type.typeScore = setData.totalScore
          targetType = type
          targetIndex = tIndex
          break
        }
      }
      if (targetType) {
        paperData.questionGroups[targetIndex] = targetType
      }
      return paperData
    },
    getScoreParams() {
      let typeQItems = []
      for (let qindex = 0; qindex < this.datas.length; qindex++) {
        const qItem = this.datas[qindex]
        let formItem = {}
        formItem.showChildQuestion = qItem.bitShowChildQuestion
        formItem.paperQuestionId = qItem.paperQuestionId
        formItem.questionBlankScoreForms = []
        formItem.score = qItem.score
        let childScoreForms = []
        let questionBlankScoreForms = []
        // 子类型
        // child代替children封装
        if (qItem.child.length > 0) {
          for (let sindex = 0; sindex < qItem.child.length; sindex++) {
            let subItem = qItem.child[sindex]
            let subItemChild = qItem.child[sindex]
            let childFormItem = {}
            childFormItem.paperQuestionId = subItemChild.paperQuestionId
            childFormItem.score = subItem.score
            let blankScoreForms = []
            if (subItem?.questionBlanks && subItem.questionBlanks.length > 0) {
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
            }
            childScoreForms.push(childFormItem)
          }
        } else if (qItem.questionBlanks.length > 0) {
          for (let bindex = 0; bindex < qItem.questionBlanks.length; bindex++) {
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
      return typeQItems
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
