<template>
  <LogoApp :loading="true"/>  
</template>

<script>

import LogoVue from './Logo.vue'

export default {
  components: {
    LogoApp: LogoVue,
  }
}

</script>
