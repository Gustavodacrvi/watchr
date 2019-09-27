<template>
  <div class="Mobile">
    <div class="central">
      <Icon class="cursor" icon="menu" width="30px" :primaryHover="true" @click="openMenu"/>
      <h2 v-if="navBar && navBar.title" class="title">{{ navBar.title }}</h2>
      <IconDrop v-if="navBar && navBar.options"
        handle="settings-v"
        :options="navBar.options"
        handle-color="var(--gray)"
        width="100px"
      />
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'

import { mapState } from 'vuex'

export default {
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
  },
  methods: {
    openMenu() {
      this.$router.push('/menu')
    }
  },
  computed: {
    ...mapState(['navBar'])
  }
}

</script>

<style scoped>

.Mobile {
  width: 100%;
  height: 100%;
  padding: 0 16px;
}

.Icon {
  transition-duration: .2s;
}

.IconDrop {
  position: absolute;
  right: 6px;
  transform: translateY(11px);
}

.central {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.title {
  display: inline-block;
  margin: 0;
  margin-left: 10px;
  transform: translateY(-2.5px);
}

</style>
