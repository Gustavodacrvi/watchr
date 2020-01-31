<template>
   <div>
      <CalendarPicker
        @select="selectDate"
        :repeat='content.repeat'
        :onlyDates='content.onlyDates'
        :defaultTime='content.time'
        :initalDate='content.initial'
        :noTime='content.noTime'
        :allowNull='content.allowNull'
        @repeat='openRepeatOptions'
        @calc='$emit("calc")'
        @get-time='getTime'
      />
    </div>
</template>

<script>

import CalendarPicker from './Calendar/CalendarPicker.vue'
import { mapGetters } from 'vuex'

import mom from 'moment'

export default {
  props: ['content'],
  components: {
    CalendarPicker,
  },
  methods: {
    getTime(initial) {
      this.$emit('update', {
        comp: 'TimePicker',
        content: {
          callback: time => {
            return {
              comp: 'CalendarPicker',
              content: {...this.content, time, initial},
            }
          },
          initial: this.content.time ? this.content.time : mom().format('HH:mm'),
        }
      })
    },
    openRepeatOptions() {
      this.$emit('update', {
        comp: "RepeatPicker",
        cardOptions: {
          overflow: true,
        },
        content: {
          disableDaily: this.content.disableDaily,
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
}

</script>
