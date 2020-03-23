
import mom from 'moment'

import timeline from "@/utils/timeline"

import { mapState } from "vuex"

export default {
  methods: {
    ...timeline,
    round(num, toRound) {
      const round = Math.floor(toRound)
      const rest = round % num
      
      if (rest === 0)
        return toRound
      return round - rest
    },
    formatTime(time) {
      return mom(time, 'HH:mm').format(this.format)
    },
  },
  computed: {
    ...mapState(['userInfo']),
    format() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    }
  }
}
