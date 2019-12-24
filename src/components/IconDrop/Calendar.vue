<template>
   <div>
      <CalendarPicker
        @select="selectDate"
        :repeat='content.repeat'
        :onlyDates='content.onlyDates'
        @repeat='openRepeatOptions'
        @calc='$emit("calc")'
      />
    </div>
</template>

<script>

import CalendarPicker from './Calendar/CalendarPicker.vue'
import { mapGetters } from 'vuex'

export default {
  props: ['content'],
  components: {
    CalendarPicker,
  },
  methods: {
    openRepeatOptions() {
      this.$emit('update', {
        comp: "RepeatPicker",
        cardOptions: {
          overflow: true,
        },
        content: {
          callback: this.selectDate,
        },
      })

    },
    selectDate(date) {
      if (this.content.callback) {
        const obj = this.content.callback(date)
        if (!obj) {
          this.$emit('close')
        } else this.$emit('update', obj)
      }
      setTimeout(() => {
        this.$store.commit('clearSelected')
      }, 100)
    },
  },
  computed: {
    ...mapGetters(['l']),
  }
}

</script>

<style scoped>

</style>
