<template>
  <input v-model.trim="str" class="Input cbd" autocomplete="off" type="text" @keydown="evt => $emit('keydown', evt)">
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
      setTimeout(() => this.$el.focus(), 200)
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
