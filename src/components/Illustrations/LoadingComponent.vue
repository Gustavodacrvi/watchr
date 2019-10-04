<template>
  <div class="LoadingComponent">
    <LogoApp :loading="true"/>  
  </div>
</template>

<script>

import LogoVue from './Logo.vue'

export default {
  components: {
    LogoApp: LogoVue,
  }
}

</script>

<style scoped>

.LoadingComponent {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-grow: 1;
}

</style>
