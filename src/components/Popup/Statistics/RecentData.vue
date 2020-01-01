<template>
  <div class="RecentData popup scroll-thin cb shadow rb">
    <div class="tac title">
      <h3 class="pc">{{ l['Recent Data'] }}</h3>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['l']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.RecentData {
  overflow: hidden;
}

</style>
