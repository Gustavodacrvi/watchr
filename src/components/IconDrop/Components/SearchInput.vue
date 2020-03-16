<template>
  <input class="SearchInput"
    :value="str"
    autocomplete="off"
    :placeholder='placeholder || "Search..."'
    type="text"
    ref='input'
    @input="v => str = v.target.value"
  >
</template>

<script>

export default {
  props: ['placeholder', 'value', 'focus'],
  data() {
    return {
      str: this.value || '',
    }
  },
  mounted() {
    if (this.focus)
      this.focusInput()
  },
  methods: {
    focusInput() {
      setTimeout(() => {
        this.$el.focus()
      }, 50)
    },
  },
  watch: {
    str() {
      this.$emit('input', this.str)
    },
  },
}

</script>

<style scoped>

.SearchInput {
  padding: 16px;
  width: 100%;
  outline: none;
  font-size: 1.2em;
  background-color: var(--light-sidebar-color);
}

</style>
