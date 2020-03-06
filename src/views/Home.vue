<template>
  <main class="Home">
    
    <div class="main">
      <img src="/svg/background.svg" alt="background">
    </div>
    
  </main>
</template>

<script>

import AuthButton from '@/components/Auth/Button.vue'
import Info from "@/components/Home/Info.vue"

export default {
  components: {
    AuthButton,
    Info,
  },
}

</script>

<style scoped>

.Home {
  display: flex;
  justify-content: center;
}

</style>
