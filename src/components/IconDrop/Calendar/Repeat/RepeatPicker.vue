<template>
  <div class="RepeatPicker" :class="platform">
    <span>{{ l["Repeat:"] }}   </span>
    <AuthOptions
      :options='repeatOptions'
      :active='activeRepeatOption'
      minWidth='200px'
      @select='v => activeRepeatOption = v'
    />
    <div class="hr"></div>
    <div>
      Repeat
      <AuthNumberInput
        v-model="days"
        width='15px'
      />
       days after task completion.
    </div>
  </div>
</template>

<script>

import AuthOptions from "@/components/Auth/Options.vue"
import AuthNumberInput from "@/components/Auth/NumberInput.vue"

import { mapGetters } from 'vuex'

export default {
  components: {
    AuthOptions, AuthNumberInput,
  },
  data() {
    return {
      days: 1,
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
  flex-basis: 450px;
  width: 450px;
  margin: 12px;
  padding: 0 12px;
}

.hr {
  margin: 12px 0;
  border: 1px solid var(--dark);
}

</style>
