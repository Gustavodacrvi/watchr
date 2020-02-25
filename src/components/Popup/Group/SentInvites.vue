<template>
  <div class="addFolder popup cb shadow rb" :class="layout">
    <div class="tac title">
      <h3 class="pc">Invited users</h3>
    </div>
    <div class="content">
      <InvitedUsers/>
    </div>
  </div>
</template>

<script>

import InvitedUsers from "@/components/View/RenderComponents/InvitedUsers.vue"

import { mapGetters } from 'vuex'

export default {
  components: {
    InvitedUsers,
  },
  computed: {
    ...mapGetters(['layout']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
