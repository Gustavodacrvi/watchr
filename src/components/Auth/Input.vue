<template>
  <input :value="str" @input="v => str = v.target.value" class="Input cbd" autocomplete="off" type="text" @keydown="keydown">
</template>

<script>

export default {
  props: ['focus', 'value'],
  data() {
    return {
      str: '',
      control: false,
    }
  },
  created() {
    this.str = this.value
  },
  mounted() {
    this.focusInput()
  },
  methods: {
    focusInput() {
      setTimeout(() => {
        if (this.focus && this.$el)
          this.$el.focus()
      }, 200)
    },
    keyup({key}) {
      if (key === 'Control') this.control = false
    },
    keydown(evt) {
      this.$emit('keydown', evt)
      const key = evt.key
      if (key === 'Enter') this.$emit('enter')
      else if (key === "Escape")
        this.$emit('cancel')
      else if (key === 'Control') this.control = true
      if (this.control) {
        if (key === 'ArrowLeft') this.$emit('goup')
        if (key === 'ArrowRight') this.$emit('godown')
        this.focusInput()
      }
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

.no-back {
  background-color: transparent !important;
}

</style>
