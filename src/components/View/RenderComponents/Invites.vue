
<template>
  <div class="InvitedUsers">
    <GroupUserProfile v-for="i in invites"
      :key="i.id"

      v-bind="i.ownerProfile"

      :groupName='i.groupName'

      :created='i.created'
      @delete='deleteInvite(i)'
      @accept='acceptInvite(i)'
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
  methods: {
    deleteInvite(obj) {
      this.$store.dispatch('invites/rejectInvite', obj)
    },
    acceptInvite() {

    },
  },
  computed: {
    ...mapGetters({
      sortedToMeInvites: 'invites/sortedToMeInvites',
      getSentInvitesByGroupId: 'invites/getSentInvitesByGroupId',
    }),
    invites() {
      return this.sortedToMeInvites
    },
  }  
}

</script>

<style scoped>

</style>
