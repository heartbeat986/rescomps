<template>
  <el-dialog
    :visible="dialogVisible"
    :title="dialogTitle"
    :width="width"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <div class="content">
      <slot />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <slot name="footer" />
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
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
    width: {
      type: String,
      default: '420px'
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
  methods: {
    handleClose(done) {
      done()
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  padding: 25px 0 5px 0;
}
</style>
