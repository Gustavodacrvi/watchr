<template>
  <div class="popup cb shadow rb Profile scroll-thin" :class="platform">
    <div class="nav-wrapper">
      <div class="nav">
        <span class="option rb cursor remove-highlight" :class="{active: 'General' === option}" @click="option = 'General'">General</span>
        <span class="option rb cursor remove-highlight" :class="{active: 'Appnav' === option}" @click="option = 'Appnav'">Appnav</span>
      </div>
    </div>
    <div class="cont-wrapper">
      <div class="cont">
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
        <p>cont</p>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      option: 'General',
    }
  },
  computed: {
    ...mapGetters(['platform'])
  },
}

</script>

<style scoped>

.Profile.desktop {
  flex-basis: 800px;
  margin-left: 12px;
  margin-right: 12px;
  height: 400px;
}

.Profile {
  position: relative;
  display: flex;
  overflow: auto;
}

.nav-wrapper {
  position: sticky;
  left: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background-color: var(--dark);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.nav {
  margin: 14px;
}

.cont-wrapper {
  flex-basis: 100%;
}

.cont {
  margin: 14px;
}

.option {
  height: 35px;
  display: flex;
  align-items: center;
  padding-left: 18px;
  transform: scale(1,1);
  transition-duration: .2s;
}

.option:hover, .option.active {
  background-color: var(--light-gray);
  color: var(--primary);
}

.option:active {
  transform: scale(.95,.95);
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
