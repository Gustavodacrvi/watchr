<template>
  <input v-model="str" class="input cbd" autocomplete="off">
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
      const el = this.$el
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

.input {
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 1em;
}

</style>
