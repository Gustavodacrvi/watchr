<template>
  <span>
    <Icon v-if="assigned === owner"
      icon='crown'
    />
    <Icon v-else-if='assigned === uid'
      icon='user'
      color='var(--primary)'
    />
    <ProfilePhoto v-else
      class="photo"
      :photoURL='userPhoto'
      size='ultra-small'
      :display='true'
    />
  </span>
</template>

<script>

import ProfilePhoto from "@/components/View/RenderComponents/ProfilePhoto.vue"

import { mapState } from 'vuex'

export default {
  components: {
    ProfilePhoto,
  },
  props: ['assigned', 'owner', 'userPhoto'],
  computed: {
    ...mapState({
      uid: state => state.user.uid,
    }),
  },
}

</script>
