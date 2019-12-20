<template>
  <div class="popup cb shadow rb Profile" :class="platform">
    Profile
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['platform'])
  }
}

</script>

<style scoped>

.Profile.desktop {
  flex-basis: 800px;
  margin-left: 12px;
  margin-right: 12px;
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
