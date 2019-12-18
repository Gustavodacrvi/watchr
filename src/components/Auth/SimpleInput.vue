<template>
  <input class="SimpleInput cbd rb"
    autocomplete="off"
    type="text"
    :value="str"
    @input="v => str = v.target.value"
    @keydown="fixWidth"
  />
</template>

<script>

export default {
  props: ['value'],
  data() {
    return {
      str: this.value,
    }
  },
  mounted() {
    this.fixWidth()
  },
  methods: {
    fixWidth() {
      setTimeout(() => {
        this.$el.style.width = ((this.$el.value.length + 1) * 12) + 'px'
      })
    }
  },
  watch: {
    str() {
      this.$emit('input', this.str)
    },
    value() {
      this.str = this.value
    }
  }  
}

</script>

<style scoped>

.SimpleInput {
  padding: 4px;
  font-size: 1em;
  outline: none;
  width: 15px;
  max-width: 100px;
}

</style>
