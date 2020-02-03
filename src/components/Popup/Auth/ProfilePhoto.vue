<template>
  <div
    class="ProfilePhoto"
    :class='{doesntHavePhoto: !url}'
    :style="{backgroundImage: `url('${url}')`, width: getProfileWidth, height: getProfileWidth}"
  >
    <Icon v-if="!url"
      icon='user'
      color='var(--fade)'
      :width='getIconSize'
    />
  </div>
</template>

<script>

import Icon from "@/components/Icon.vue"
import { mapState } from 'vuex'

export default {
  props: ['photoURL', 'size'],
  components: {
    Icon,
  },
  computed: {
    ...mapState(['user']),
    url() {
      return null
      return this.photoURL || this.user.photoURL
    },
    getIconSize() {
      switch (this.size) {
        case 'normal': return '28px'
        default: return '28px'
      }
    },
    getProfileWidth() {
      switch (this.size) {
        case 'normal': return '75px'
        default: return '75px'
      }
    },
  },
}

</script>

<style scoped>

.ProfilePhoto {
  border-radius: 1000px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-position: center;
}

.doesntHavePhoto {
  background-color: var(--sidebar-color);
}

</style>
