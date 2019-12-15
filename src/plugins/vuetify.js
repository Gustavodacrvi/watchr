
import Vue from 'vue'
import Vuetify, { VTimePicker } from 'vuetify/lib'

Vue.use(Vuetify, {
  components: {VTimePicker}
})

const opts = {}

export default new Vuetify(opts)
