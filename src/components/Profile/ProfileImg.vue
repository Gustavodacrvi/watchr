<template>
  <div @click='click'
    class="ProfileImg shadow"
    :class="{nophoto, enabled}"
    :style='style'
  >
    <Icon v-if="nophoto" icon="user" width="65%"/>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

import { mapState } from 'vuex'

import utils from '@/utils'

export default {
  props: ['enable'],
  components: {
    Icon: IconVue,
  },
  mounted() {
    if (this.enable) {
      utils.bindOptionsToEventListener(this.$el, [
        {
          name: 'yeai',
          icon: 'user',
        }
      ], this, 'click')
    }
  },
  methods: {
    click(evt) {
      if (this.enable) evt.stopPropagation()
    },
  },
  computed: {
    ...mapState(['user']),
    nophoto() {
      if (!this.user) return true
      return !this.user.photoURL
    },
    enabled() {
      return this.enable
    },
    style() {
      if (this.user)
        return `background-image: url("${this.user.photoURL}");`
      return {}
    },
  },
}

</script>

<style scoped>

.ProfileImg {
  display: inline-block;
  border-radius: 150px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
}

.nophoto {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: var(--card);
  color: var(--light-gray);
}

.enabled {
  cursor: pointer;
}

</style>
