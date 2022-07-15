<template>
  <button
    :disabled="loading || shouldDisabled"
    :class="
      loading || shouldDisabled ? `disabled ${classNames}` : `${classNames}`
    "
    @click.stop.prevent="doAction"
  >
    <i v-if="loading" class="el-icon-loading" />
    {{ btnTitle }}
  </button>
</template>

<script>
export default {
  name: 'LoadingBtn',
  components: {},
  props: {
    shouldDisabled: {
      type: Boolean,
      default() {
        return false
      }
    },
    value: {
      type: String,
      default() {}
    },
    classNames: {
      type: String,
      default() {
        return 'level_4'
      }
    },
    actionFunc: {
      type: Function,
      default() {
        return () => {}
      }
    },
    btnTitle: {
      type: String,
      default() {
        return '确定'
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {
    async doAction() {
      this.loading = true
      if (this.actionFunc) {
        let isSuccess = await this.actionFunc()
        console.log(isSuccess)
        this.$emit('actionFinish', isSuccess)
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped></style>
