<template>
  <div class="GroupProfilePhotos"
    @click="click"
  >
    <Photo
      :photoURL='ownerURL'
      size='ultra-small'
      :display='true'
    />
    <div class="members">
      <Photo v-for="m in groupMembers"
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
      if (this.isOwner)
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
    groupMembers() {
      if (!this.groupInfo)
        return []
      const users = Object.keys(this.groupInfo.profiles)
            .map(k => this.groupInfo.profiles[k])
            .filter(i => i && i.uid !== this.groupInfo.userId)
      
      users.sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()))

      return users
    },
    ownerURL() {
      return this.groupInfo.profiles[this.groupInfo.userId].photoURL
    },
    isOwner() {
      return this.userId === this.userId
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
}

</style>
