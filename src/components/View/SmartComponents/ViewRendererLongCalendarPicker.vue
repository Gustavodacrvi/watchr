<template>
  <LongCalendarPicker
    @select="select"
  />
</template>

<script>

import LongCalendarPicker from './LongCalendarPicker.vue'

export default {
  components: {
    LongCalendarPicker,
  },
  methods: {
    select(date) {
      this.$emit('update', date)
    },
  },
}

</script>

<style scoped>

</style>
