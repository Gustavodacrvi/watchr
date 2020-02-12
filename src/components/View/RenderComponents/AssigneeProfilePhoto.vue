<template>
  <span>
    <Icon v-if="assigned === owner"
      icon='crown'
      width='22px'
    />
    <Icon v-else-if='assigned === uid'
      icon='user'
      width='22px'
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
import Icon from "@/components/Icon.vue"

import { mapState } from 'vuex'

export default {
  components: {
    ProfilePhoto,
    Icon,
  },
  props: ['assigned', 'owner', 'userPhoto'],
  computed: {
    ...mapState({
      uid: state => state.user.uid,
    }),
  },
}

</script>
