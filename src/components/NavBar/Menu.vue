<template>
  <div class="Menu cbd">
    <div class="appbar-wrapper">
      <Icon class="arrow cursor" icon="arrow" color="var(--gray)" @click="$router.go(-1)" :primaryHover="true"/>
      <Appbar/>
    </div>
  </div>
</template>

<script>

import AppbarVue from '../Appbar/Appbar.vue'
import IconVue from '../Icon.vue'

export default {
  components: {
    Appbar: AppbarVue,
    Icon: IconVue,
  }
}

</script>

<style scoped>

.Menu {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  z-index: 500;
}

.appbar-wrapper {
  margin: 16px;
}

.arrow {
  transform: rotate(90deg);
}

</style>
