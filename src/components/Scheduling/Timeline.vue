<template>
  <div class="Timeline">
    <BackLines
      :lineHeight='lineHeight'
      :height='height'
    />
  </div>
</template>

<script>

import BackLines from './BackLines.vue'

export default {
  components: {
    BackLines,
  },
  props: ['date'], 
  data() {
    return {
      height: 1700,
    }
  },
  computed: {
    lineHeight() {
      return this.height / 24
    },
  },
}

</script>

<style scoped>

.Timeline {
  max-height: 100%;
  overflow: auto;
}

</style>
