<template>
  <input class="SimpleInput cbd rb"
    autocomplete="off"
    type="text"
    :value="str"
    @input="v => str = v.target.value"
    onkeydown="this.style.width = ((this.value.length + 1) * 12) + 'px';"
  />
</template>

<script>

export default {
  props: ['value'],
  data() {
    return {
      str: this.value + '',
    }
  },
  watch: {
    str() {
      this.$emit('input', parseInt(this.str, 10))
    },
    value() {
      this.str = this.value + ''
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
