<template>
   <div>
      <CalendarPicker @select="selectDate"/>
    </div>
</template>

<script>

import CalendarPicker from './Calendar/CalendarPicker.vue'

export default {
  props: ['content'],
  components: {
    CalendarPicker,
  },
  methods: {
    selectDate(date) {
      if (this.content.callback) {
        this.content.callback(date)
        this.$emit('close')
        setTimeout(() => {
          this.$store.commit('clearSelected')
        }, 100)
      }
      this.showing = false
      this.$store.commit('clearSelected')
    },
  } 
}

</script>

<style scoped>

</style>
