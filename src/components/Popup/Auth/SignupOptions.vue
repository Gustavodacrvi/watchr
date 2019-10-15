<template>
  <div class="Signup popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Sign up option'] }}</h3>
    </div>
    <div class="content">
      freaking work
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  methods: {

  },
  computed: {
    ...mapGetters(['platform', 'l'])
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
