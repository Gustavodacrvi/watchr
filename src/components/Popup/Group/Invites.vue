<template>
  <div class="addFolder popup cb shadow rb" :class="layout">
    <div class="tac title">
      <h3 class="pc">Invites</h3>
    </div>
    <div class="content">
      <Invites/>
    </div>
  </div>
</template>

<script>

import Invites from "@/components/View/RenderComponents/Invites.vue"

import { mapGetters } from 'vuex'

export default {
  components: {
    Invites,
  },
  computed: {
    ...mapGetters(['layout']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
