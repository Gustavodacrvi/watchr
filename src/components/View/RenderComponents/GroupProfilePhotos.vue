<template>
  <div class="GroupProfilePhotos"
    @click="click"
  >
    <Photo v-if="!isOwner"
      :photoURL='ownerURL'
      size='ultra-small'
      :display='true'
    />
    <Icon v-else
      icon='crown'
      color='yellow'
    />
    <div class="members">
      <Photo v-for="m in groupMembers"
        class="mem"
        :key="m.uid"
        :photoURL='m.photoURL'
        size='ultra-small'
        :stopAuthFallback='true'
        :display='true'
      />
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'

import Photo from "@/components/View/RenderComponents/ProfilePhoto.vue"

export default {
  props: ['group'],
  components: {
    Photo,
  },
  methods: {
    click() {
      this.$store.dispatch('pushPopup', {
        comp: 'InvitePeople',
        payload: this.group,
      })
    },
  },
  computed: {
    ...mapState({
      userId: state => state.user.uid,
      groups: state => state.group.groups,
    }),
    groupInfo() {
      return this.groups.find(el => el.id === this.group)
    },
    isOwner() {
      return this.userId === this.groupInfo.userId
    },
    groupMembers() {
      if (!this.groupInfo)
        return []
      const users = Object.keys(this.groupInfo.profiles)
            .map(k => this.groupInfo.profiles[k])
            .filter(i => i && i.uid !== this.groupInfo.userId)
      
      users.sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()))

      return users
    },
    ownerProfile() {
      return this.groupInfo.profiles[this.groupInfo.userId]
    },
    ownerURL() {
      return this.ownerProfile.photoURL
    },
  },
}

</script>

<style scoped>

.GroupProfilePhotos {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.members {
  margin-left: 10px;
  margin-right: -8px;
  transform: translateY(-1px);
  display: flex;
  align-items: center;
}

.mem {
  background-color: var(--light-gray);
}

</style>
