<template>
  <div class="TimePicker">
    <span v-if="content.msg" class="msg">{{ content.msg }}</span>
    <div class="wrapper">
      <VTimePicker
        v-bind="getProps"
      
        :noTitle='true'
        :scrollable='true'
        :dark='true'
        :format='getFormat'
        :value='content.initial ? content.initial : undefined'

        width='225px'
        @change='callback'
      />
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  props: ['content'],
  methods: {
    callback(str) {
      const close = () => {
        this.$emit('close')
        this.$store.commit('clearSelected')
      }
      
      const res = this.content.callback(str)
      if (!res || (res && res.then)) close()
      else this.$emit('update', res)
    }
  },
  computed: {
    ...mapState(['userInfo']),
    getProps() {
      return (this.content && this.content.props) ? this.content.props : {}
    },
    getFormat() {
      if (this.content.format) return this.content.format
      if (this.userInfo.disablePmFormat)
        return '24hr'
      return 'ampm'
    },
  },
}

</script>

<style>

.v-picker {
  color: var(--white) !important;
  box-shadow: none !important;
}

.v-picker__body {
  background-color: var(--card) !important;
}

.v-time-picker-clock {
  background-color: var(--light-gray) !important;
}

.v-picker__title__btn {
  opacity: .6 !important;
}

.v-picker__title__btn--active {
  color: white !important;
  opacity: 1 !important;
}

.v-time-picker-clock__hand, .v-time-picker-clock__item--active {
  background-color: var(--primary) !important;
}

.v-time-picker-clock__hand::before, .v-time-picker-clock__hand::after {
  color: var(--primary);
}

</style>

<style scoped>

.msg {
  margin-left: 34px;
}

.wrapper {
  width: 275px !important;
  display: flex;
  justify-content: center;
}

</style>
