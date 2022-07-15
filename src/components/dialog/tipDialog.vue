<template>
  <el-dialog
    :visible="dialogVisible"
    :title="dialogTitle"
    :width="width"
    :show-close="showClose"
    :close-on-click-modal="false"
    :append-to-body="appendBody"
    :before-close="handleClose"
  >
    <div class="content">
      <slot />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <slot name="footer">
          <button class="btn form-cancel_btn form-level1_infour" @click="close">
            取消
          </button>
          <button class="btn main_btn form-level1_infour" @click="confirm">
            确定
          </button>
        </slot>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'TipDialog',
  props: {
    value: {
      type: Boolean,
      default() {
        return false
      }
    },
    title: {
      type: String,
      default: '提示'
    },
    type: {
      type: Number,
      default: 1
    },
    appendBody: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    closeHandler: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      width: '400px'
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
    },
    dialogTitle() {
      return this.title
    }
  },
  watch: {
    type(val) {
      this.handleWidth(val)
    }
  },
  mounted() {
    this.handleWidth(this.type)
  },
  methods: {
    handleWidth(type) {
      if (type === 1) {
        this.width = '800px'
      } else if (type === 2) {
        this.width = '600px'
      } else if (type === 3) {
        this.width = '400px'
      } else if (type === 4) {
        this.width = '900px'
      }
    },
    handleClose() {
      // 如果传了关闭处理，则调用关闭处理
      if (this.closeHandler) {
        this.closeHandler()
      } else {
        this.close()
      }
    },
    close() {
      this.dialogVisible = false
      this.$emit('cancel')
    },
    confirm() {
      this.$emit('confirm')
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 25px 0 5px 0;
  text-align: center;
  // max-height: 500px;
  // 560px:比较完美
  max-height: 560px;
}
</style>
