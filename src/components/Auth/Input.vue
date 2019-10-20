<template>
  <input v-model.trim="str" class="Input cbd" autocomplete="off" type="text" @keydown="keydown">
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
  methods: {
    keydown({key}) {
      if (key === 'Enter') this.$emit('enter')
      evt => $emit('keydown', evt)
    }
  },
  watch: {
    str(str) {
      this.$emit('input', str)
    },
    value() {
      this.str = this.value
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

.no-border-down {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

</style>
