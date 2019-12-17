<template>
  <div class="RepeatPicker" :class="platform">
    <span>{{ l["Repeat:"] }}   </span>
    <AuthOptions
      :options='repeatOptions'
      :active='activeRepeatOption'
      minWidth='200px'
      @select='v => activeRepeatOption = v'
    />
  </div>
</template>

<script>

import AuthOptions from "@/components/Auth/Options.vue"

import { mapGetters } from 'vuex'

export default {
  components: {
    AuthOptions,
  },
  data() {
    return {
      activeRepeatOption: 'After completion',
      repeatOptions: [
        'After completion',
        'Daily',
        'Weekly',
        'Monthly',
        'Yearly',
      ]
    }
  },
  computed: {
    ...mapGetters(['platform', 'l'])
  }
}

</script>

<style scoped>

.RepeatPicker.desktop {
  flex-basis: 400px;
  width: 400px;
  margin: 12px;
  padding: 0 12px;
}

</style>
