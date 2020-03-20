
import mom from 'moment'

import timeline from "@/utils/timeline"

import { mapState } from "vuex"

export default {
  methods: {
    ...timeline,
    round(num, toRound) {
      while ((Math.floor(toRound) % num) !== 0) {
        toRound = Math.floor(toRound) - 1
      }
      return Math.floor(toRound)
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
