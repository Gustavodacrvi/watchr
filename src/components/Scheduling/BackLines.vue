<template>
  <div
    class="BackLines"
    :style="{height: (height + lineHeight) + 'px'}"
  >

    <div v-for="time in lines" :key="time.id"
      class="time-line"

      :style="{top: time.top}"
    >
      <div class="line-wrapper">
        <div class="line"></div>
        <div class="time">{{ time.time }}</div>
      </div>
    </div>

  </div>
</template>

<script>

import mom from 'moment'

import { mapState } from 'vuex'

export default {
  props: ['height', 'lineHeight'],
  computed: {
    ...mapState(['userInfo']),
    lines() {
      const arr = []

      const inital = mom()
      const tod = inital.clone()

      tod.hour(0)
      tod.minute(0)
      tod.second(0)

      let num = 0

      do {
        
        const time = tod.format(this.format)

        arr.push({
          time,
          id: time,
          top: (this.lineHeight * num) + 'px',
        })

        tod.add(1, 'h')
        num++
      } while (inital.isSame(tod, 'day'))

        const time = tod.format(this.format)

        arr.push({
          time,
          id: time + 'final',
          top: (this.lineHeight * num) + 'px',
        })

      return arr
    },
    format() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    }
  },
}

</script>

<style scoped>

.BackLines {
  margin-top: 50px;
  position: relative;
}

.time-line {
  position: absolute;
  width: 100%;
}

.line-wrapper {
  position: relative;
}

.time {
  color: var(--fade);
  position: absolute;
  transform: translateY(-55%);
  display: inline-block;
  background-color: var(--sidebar-color);
  padding: 0 8px;
  padding-left: 0;
}

.line {
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  border: 1px solid var(--light-gray);
}

</style>
