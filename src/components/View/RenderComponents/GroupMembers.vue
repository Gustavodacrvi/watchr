
<template>
  <div class="InvitedUsers">
    <GroupUserProfile v-for="i in nonOwnerMember"
      :key="i.id"

      v-bind="i"

      :groupName='group.name'

      :created='i.created'
      :denied='false'
      :member='true'
      @delete='deleteMember(i)'
    />
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
      this.$store.dispatch('invites/removeMember', {
        groupId: this.groupId,
        uid,
      })
    },
  },
  computed: {
    ...mapState({
      user: state => state.user,
      groups: state => state.group.groups,
    }),
    ...mapGetters({
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    group() {
      return this.groups.find(el => el.id === this.groupId)
    },
    groupMembers() {
      return this.checkMissingIdsAndSortArr([], 
          Object.keys(this.group.profiles)
            .map(k => this.group.profiles[k]).filter(i => i), 'uid')
    },
    nonOwnerMember() {
      return this.groupMembers.filter(el => el.uid !== this.user.uid)
    },
  }  
}

</script>
