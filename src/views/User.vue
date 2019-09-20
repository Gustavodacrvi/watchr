<template>
  <div class="User">
    <div class="nav">
      <Appbar/>
    </div>
    <div class="cont">

    </div>
  </div>
</template>

<script>

import AppbarVue from '../components/NavBar/Appbar.vue'

export default {
  components: {
    Appbar: AppbarVue,
  }
}

</script>

<style scoped>

.User {
  margin: 8px 60px;
  display: flex;
}

.nav {
  flex-basis: 400px;
  min-height: 100%;
}

.cont {
  flex-basis: 100%;
}

</style>
