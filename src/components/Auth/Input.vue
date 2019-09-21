<template>
  <input v-model="str" class="Input cbd" autocomplete="off">
</template>

<script>

export default {
  props: ['focus', 'value'],
  data() {
    return {
      str: '',
    }
  },
  created() {
    this.str = this.value
  },
  mounted() {
    if (this.focus) {
      setTimeout(() => this.$el.focus(), 100)
    }
  },
  watch: {
    str(str) {
      this.$emit('input', str)
    }
  }
}

</script>

<style scoped>

.Input {
  border: none;
  padding: 12px;
  outline: none;
  border-radius: 10px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
}

</style>
