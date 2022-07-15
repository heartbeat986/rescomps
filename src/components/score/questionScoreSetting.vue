<!--
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-01-24 13:35:18
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-06-10 09:59:33
-->
<template>
  <tip-dialog v-model="dialogVisible" :type="2" title="分数设置">
    <question-set-view
      ref="setView"
      :question-data="questionData"
    ></question-set-view>
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
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { ScoreCalculateMixin } from '@/mixins/scoreCalculateMixin'
import QuestionSetView from './questionSetView'
import homeworkType from '@/store/type/homeworkType'
export default {
  name: 'QuestionScoreSetting',
  components: { tipDialog, loadingBtn, QuestionSetView },
  mixins: [ScoreCalculateMixin],
  props: {
    value: {
      type: Boolean,
      default() {
        return false
      }
    },
    questionData: {
      type: Object,
      default() {
        return {}
      }
    },
    paperData: {
      type: Object,
      default() {
        return {}
      }
    },
    paperId: {
      type: [Number, String],
      default() {
        return ''
      }
    }
  },
  data() {
    return {
      data: {}
    }
  },
  computed: {
    ...mapGetters(['reviewPaperData', 'reviewPaperId']),
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
  mounted() {},
  methods: {
    ...mapMutations({
      reviewUpdateScore: homeworkType.PAPER_UPDATE_SCORE_M
    }),
    ...mapActions({
      reviewSetScore: homeworkType.DO_SET_SCORE
    }),
    doClose() {
      this.dialogVisible = false
    },
    doSettingScore() {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        // 更新试卷数据
        try {
          let setView = this.$refs.setView
          if (setView) {
            setView.validateForm(async (result, validaError, setData) => {
              console.log('result:', result)
              if (result) {
                this.data = setData.data
                let paperData = this.updateData()
                let questionScoreFormList = this.getScoreParams(
                  paperData.questionGroups
                )
                let params = {
                  paperId: this.paperId,
                  paperQuestionGroupId: null,
                  paperQuestionGroupName: null,
                  questionScoreFormList: questionScoreFormList,
                  type: 0
                }
                try {
                  await this.reviewSetScore({ params, paperData })
                  this.dialogVisible = false
                  resolve(true)
                  this.$message.success('设置成功')
                } catch (error) {
                  resolve(false)
                  this.$message.error(error.message)
                }
              } else {
                resolve(false)
                console.log(validaError)
                let keys = Object.keys(validaError)
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
          this.$message.error(`${error.message}`)
        }
      })
    },
    updateData() {
      let paperData = _.cloneDeep(this.reviewPaperData)
      let typeIndex = _.findIndex(paperData.questionGroups, (groupItem) => {
        return groupItem.id === this.data.paperQuestionGroupId
      })
      if (typeIndex > -1) {
        // 分组
        let type = paperData.questionGroups[typeIndex]
        let index = _.findIndex(type.paperQuestions, (question) => {
          return question.paperQuestionId === this.data.paperQuestionId
        })
        if (index > -1) {
          type.paperQuestions[index] = this.data
        }
        paperData.questionGroups[typeIndex] = type
      } else {
        // 混排
        let type = paperData.questionGroups[0]
        console.log('type:', type)
        let index = _.findIndex(type.paperQuestions, (question) => {
          return question.paperQuestionId === this.data.paperQuestionId
        })
        console.log('index:', index)
        if (index > -1) {
          type.paperQuestions[index] = this.data
        }
        paperData.questionGroups[typeIndex] = type
      }
      console.log(paperData)
      return paperData
    },
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
