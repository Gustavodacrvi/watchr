<template>
  <div id='app-navigation' :class='$store.state.theme.style'>
    <div id='navigation-margin'></div>
    <icon-section ico='home'>
      <template v-slot:top>
        <span>fdas</span>
      </template>
    </icon-section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Section from '@/components/appNavigation/Section.vue';

export default Vue.extend({
  components: {
    'icon-section': Section,
  },
});
</script>

<style scoped>

#app-navigation.light {
  background-color: #EEEDED;
  box-shadow: inset 0 0 6px #b4b4b4;
}

#app-navigation.dark {
  background-color: #282828;
}

#app-navigation {
  position: fixed;
  width: 280px;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 5;
}

#navigation-margin {
  height: 110px;
}

</style>
