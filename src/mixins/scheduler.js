
import mom from 'moment'

import timeline from "@/utils/timeline"

import { mapState } from "vuex"

export default {
  methods: {
    ...timeline,
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
