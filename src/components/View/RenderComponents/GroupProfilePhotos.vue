<template>
  <div class="GroupProfilePhotos">
    <Photo
      :photoURL='ownerURL'
      size='small'
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
  computed: {
    ...mapState({
      groups: state => state.group.groups,
    }),
    groupInfo() {
      return this.groups.find(el => el.id === this.group)
    },
    ownerURL() {
      return this.groupInfo.profiles[this.groupInfo.userId].photoURL
    }
  },
}

</script>

<style scoped>

.GroupProfilePhotos {
  display: inline-flex;
  align-items: center;
}

</style>
