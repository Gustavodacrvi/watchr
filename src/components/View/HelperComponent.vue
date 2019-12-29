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

export default {
  components: {
    LongCalendarPicker,
  },
  props: ['comp'], 
}

</script>

<style scoped>

.HelperComponent {
  position: sticky;
  bottom: 16px;
  border-radius: 8px;
  z-index: 3;
}

.close {
  margin: 4px;
}

</style>
