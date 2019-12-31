<template>
  <div class="HelperComponent shadow cb">
    <component
      :is="comp"
      :helper='true'
      @close='$emit("close")'
    />
  </div>
</template>

<script>

import LongCalendarPicker from './SmartComponents/LongCalendarPicker.vue'
import PomoHelper from './SmartComponents/PomoHelper.vue'

export default {
  props: ['comp'],
  components: {
    LongCalendarPicker,
    PomoHelper,
  },
}

</script>

<style scoped>

.HelperComponent {
  position: sticky;
  bottom: 16px;
  border-radius: 16px;
  z-index: 3;
}

.close {
  margin: 4px;
}

</style>
