<template>
   <div>
      <CalendarPicker
        @select="selectDate"
        :repeat='content.repeat'
        @repeat='openRepeatOptions'
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
      this.$emit('update', [
        {
          name: this.l['Repeat weekly'],
          icon: 'repeat',
          callback: () => ({
            comp: 'WeeklyPicker',
            content: {callback: this.selectDate},
          }),
        },
        {
          name: this.l['Repeat periodically'],
          icon: 'repeat',
          callback: () => ({
            comp: 'PeriodicPicker',
            content: {callback: this.selectDate},
          }),
        },
      ])
    },
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
  },
  computed: {
    ...mapGetters(['l']),
  }
}

</script>

<style scoped>

</style>
