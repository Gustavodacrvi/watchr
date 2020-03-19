
import mom from 'moment'

import { mapState } from "vuex"

export default {
  methods: {
    round(num, toRound) {
      while ((Math.floor(toRound) % num) !== 0) {
        toRound = Math.floor(toRound) - 1
      }
      return Math.floor(toRound)
    },
    convertOffsetToMin(offset, height) {
      return offset * 1440 / height
    },
    convertMinToOffset(min, height) {
      return height * min / 1440
    },
    formatMin(min) {
      return mom(`${Math.floor(min / 60)}-${min % 60}`, 'HH:mm').format(this.format)
    },
  },
  computed: {
    ...mapState(['userInfo']),
    format() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    }
  }
}
