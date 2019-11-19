
<template>
  <div class="FileReader">
    {{fileURL}}
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['fileURL']),
  }
}

</script>

<style scoped>

.FileReader {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 700;
  height: 100%;
}

</style>
