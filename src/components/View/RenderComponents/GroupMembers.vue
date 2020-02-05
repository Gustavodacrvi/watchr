
<template>
  <div class="InvitedUsers">
    <GroupUserProfile v-for="i in nonOwnerMember"
      :key="i.id"

      v-bind="i"

      :groupName='group.name'

      :created='i.created'
      :denied='false'
      :member='true'
      @delete='deleteInvite(i)'
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
    deleteInvite(i) {

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
            .map(k => this.group.profiles[k]), 'uid')
    },
    nonOwnerMember() {
      return this.groupMembers.filter(el => el.uid !== this.user.uid)
    },
  }  
}

</script>
