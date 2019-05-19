<template>
  <div id='user-app'>
    <navigation></navigation>
    <div class='user-app-content' :class='{navOpened: $store.state.app.nav.open}'>
      <transition name='fade-transition' mode='out-in'>
        <component :is='currentSection'></component>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Navigation from '@/components/appNavigation/Navigation.vue';
import LoadingComponent from '@/components/generalComponents/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./../appSections/${component}.vue`).then((m) => m.default),
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000,
});

export default Vue.extend({
  props: {
    guest: Boolean,
  },
  components: {
    navigation: Navigation,
    anytime: () => AsyncComponent('overview/Anytime') as any,
    inbox: () => AsyncComponent('overview/Inbox') as any,
    someday: () => AsyncComponent('overview/Someday') as any,
    today: () => AsyncComponent('overview/Today') as any,
    upcoming: () => AsyncComponent('overview/Upcoming') as any,
    tasks: () => AsyncComponent('Tasks') as any,
    intervals: () => AsyncComponent('Intervals') as any,
    settings: () => AsyncComponent('Settings') as any,
    statistics: () => AsyncComponent('Statistics') as any,
    routines: () => AsyncComponent('Routines') as any,
    tags: () => AsyncComponent('Tags') as any,
    help: () => AsyncComponent('Help') as any,
  },
  computed: {
    currentSection(): string {
      return this.$store.state.app.nav.component;
    },
  },
});
</script>

<style scoped>

#user-app {
  display: flex;
  justify-content: center;
}

.user-app-content {
  flex-basis: 1526px;
  padding-top: 10px;
  margin: 0 60px;
  transition: margin .3s;
}

.navOpened {
  margin: 0 40px 0 265px;
}

@media screen and (max-width: 825px) {
  .user-app-content {
    margin: 0 8px;
  }
}

</style>
