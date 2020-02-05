
<template>
  <div class="InvitedUsers">
    <template v-if="group">
      <GroupUserProfile v-for="i in nonOwnerMember"
        :key="i.id"

        v-bind="i"

        :created='i.created'
        :allowRemove='allowRemove(i)'
        :denied='false'
        :member='true'
        @delete='deleteMember(i)'
      />
    </template>
  </div>
</template>

<script>

import GroupUserProfile from './GroupUserProfile.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    GroupUserProfile,
  },
  props: ['groupId'],
  methods: {
    deleteMember({uid}) {
      const remove = id =>
        this.$store.dispatch('invites/removeMember', {
          groupId: this.groupId,
          uid: id,
        })
      
      if (!this.isOwner)
        remove(this.user.uid)
      else remove(uid)
    },
    allowRemove(i) {
      if (this.isOwner)
        return i.id !== this.user.uid
      return i.uid === this.user.uid || i.id === this.group.userId
    },
  },
  computed: {
    ...mapState({
      groups: state => state.group.groups,
      user: state => state.user,
    }),
    ...mapGetters({
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    group() {
      return this.groups.find(el => el.id === this.groupId)
    },
    groupMembers() {
      if (!this.group)
        return []
      const users = Object.keys(this.group.profiles)
            .map(k => this.group.profiles[k])
            .filter(i => i && i.uid !== this.group.userId)
      
      users.sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()))

      users.unshift(this.group.profiles[this.group.userId])

      return users
    },
    isOwner() {
      return this.user.uid === this.group.userId
    },
    nonOwnerMember() {
      if (!this.isOwner)
        return this.groupMembers
      return this.groupMembers.filter(el => el.uid !== this.group.userId)
    },
  }  
}

</script>
