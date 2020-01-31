<template>
  <div class="ItemEdit">
    <div class="wrapper">
      asdf
    </div>
  </div>
</template>

<script>

export default {
  mounted() {
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.windowClick)
  },
  methods: {
    windowClick() {
      this.$emit('close')
    },
  },
}

</script>

<style scoped>

.ItemEdit {
  overflow: hidden;
}

.wrapper {
  height: 35px;
}

</style>
