<template>
  <div class="RepeatPicker" :class="platform">
    <span>{{ l["Repeat:"] }}</span>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['platform', 'l'])
  }
}

</script>

<style scoped>

.RepeatPicker.desktop {
  flex-basis: 400px;
  margin: 12px;
  padding: 0 12px;
}

</style>
