
<template>
  <div class="InvitedUsers">
    <GroupUserProfile v-for="i in invites"
      :key="i.id"

      v-bind="i.targetProfile"

      :created='i.created'
      :denied='i.denied'
      @delete='$emit("delete", i)'
    />
  </div>
</template>

<script>

import GroupUserProfile from './GroupUserProfile.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    GroupUserProfile,
  },
  props: ['groupId'],
  computed: {
    ...mapGetters({
      getSentInvitesByGroupId: 'invites/getSentInvitesByGroupId',
    }),
    invites() {
      return this.getSentInvitesByGroupId(this.groupId)
    },
  }  
}

</script>

<style scoped>

</style>
