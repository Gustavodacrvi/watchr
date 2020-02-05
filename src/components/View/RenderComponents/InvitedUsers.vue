
<template>
  <div class="InvitedUsers">
    <GroupUserProfile v-for="i in invites"
      :key="i.id"

      v-bind="i.targetProfile"

      :groupName='groupId ? null : i.groupName'

      :created='i.created'
      :denied='i.denied'
      @delete='deleteInvite'
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
  methods: {
    deleteInvite({id}) {
      this.$store.dispatch('invites/deleteInvite', {
        inviteId: id,
        groupId: this.groupId,
      })
    },
  },
  computed: {
    ...mapGetters({
      sortedFromMeInvites: 'invites/sortedFromMeInvites',
      getSentInvitesByGroupId: 'invites/getSentInvitesByGroupId',
    }),
    invites() {
      if (!this.groupId)
        return this.sortedFromMeInvites
      return this.getSentInvitesByGroupId(this.groupId)
    },
  }  
}

</script>

<style scoped>

</style>
