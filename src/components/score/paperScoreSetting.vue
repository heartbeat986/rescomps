<!--
 * @Descripttion:
 * @Version:
 * @Author: jiaoxingxing
 * @Date: 2022-01-24 13:35:18
 * @LastEditors: jiaoxingxing
 * @LastEditTime: 2022-07-09 10:25:10
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
    let { qDatas, checkNumCount } = this.scoreAction.getFlattenArray()
    this.datas = qDatas
    this.checkNumCount = checkNumCount
  },
  methods: {
    initScoreAction() {
      this.scoreAction = new ScoreAction(this.$store, this.storeType)
    },
    doClose() {
      this.dialogVisible = false
    },
    doSettingScore() {
      return this.scoreAction.doSettingScore(this, this.paperId)
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
