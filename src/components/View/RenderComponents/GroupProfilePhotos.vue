<template>
  <div class="GroupProfilePhotos"
    :class="{isOwner}"
    @click="click"
  >
    <Photo
      :photoURL='ownerURL'
      size='small'
      :display='true'
    />
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
}

.isOwner {
  cursor: pointer;
}

</style>
