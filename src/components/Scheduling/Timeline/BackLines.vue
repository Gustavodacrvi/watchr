<template>
  <div
    class="BackLines"
    :style="{height: (height + lineHeight) + 'px'}"
  >

    <VisualLines
      :lines='lines'
    />

  </div>
</template>

<script>

import mom from 'moment'

import DivisionLine from './Line.vue'
import VisualLines from './VisualLines.vue'

import { mapState } from 'vuex'

export default {
  components: {
    DivisionLine, VisualLines,
  },
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
    },
  },
}

</script>
