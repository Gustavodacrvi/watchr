<template>
  <div class="ActionButtons" :class="platform">
    <Btn class="add"
      icon='plus'
      color='white'
    />
    <Btn class="header"
      icon='user'
      color='white'
    />
  </div>
</template>

<script>

import ActButtonVue from './ActButton.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Btn: ActButtonVue,
  },
  computed: {
    ...mapGetters(['platform'])
  }
}

</script>

<style scoped>

.ActionButtons {
  bottom: 16px;
  z-index: 15;
  pointer-events: none;
  position: sticky;
  display: flex;
  justify-content: space-between;
}

.ActionButtons .add {
  transform: translateX(-48px);
  pointer-events: all;
}

.ActionButtons .header {
  transform: translateX(48px);
  pointer-events: all;
}

.ActionButtons.mobile .add {
  right: 16px;
}

</style>
