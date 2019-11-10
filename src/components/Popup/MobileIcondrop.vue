<template>
  <div class="MobileIcondrop" @click="closeIconDrop">
    <IconDrop
      :options='iconDrop.options'
      :allowSearch='iconDrop.allowSearch'
      :calendar='iconDrop.calendar'
      :calendarCall='iconDrop.calendarCallback'
      :isMobileIconDropComp='true'
      :centralize='true'
    />
  </div>
</template>

<script>

import IconDropVue from '../IconDrop/IconDrop.vue'

import { mapState } from 'vuex'

export default {
  components: {
    IconDrop: IconDropVue,
  },
  methods: {
    closeIconDrop() {
      setTimeout(() => {
        this.$store.commit('pushIconDrop', null)
      }, 200)
    },
  },
  computed: {
    ...mapState(['iconDrop']),
  },
}

</script>

<style scoped>

.MobileIcondrop {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 500;
  background-color: rgba(0,0,0,.4);
}

</style>
