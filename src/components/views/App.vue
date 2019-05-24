<template>
  <div id='user-app'>
    <navigation></navigation>
    <div id='app-pop-ups'>
      <div id='app-pop-up-wrapper'>
        <component class='pop-up' :is='currentPopUp'></component>
      </div>
    </div>
    <div class='user-app-content' :class='{navOpened: $store.state.app.nav.open}'>
      <transition name='fade-transition' mode='out-in'>
        <component class='perspective' :is='currentSection'></component>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Navigation from '@/components/appNavigation/Navigation.vue';
import LoadingComponent from '@/components/generalComponents/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./../${component}.vue`).then((m) => m.default),
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000,
});

export default Vue.extend({
  props: {
    webStorage: Boolean,
  },
  created() {
    if (this.webStorage) {
      this.$store.commit('app/useWebStorage', true);
    } else {
      this.$store.commit('app/useWebStorage', false);
    }
  },
  components: {
    navigation: Navigation,
    anytime: () => AsyncComponent('appSections/overview/Anytime') as any,
    inbox: () => AsyncComponent('appSections/overview/Inbox') as any,
    someday: () => AsyncComponent('appSections/overview/Someday') as any,
    today: () => AsyncComponent('appSections/overview/Today') as any,
    upcoming: () => AsyncComponent('appSections/overview/Upcoming') as any,
    custom: () => AsyncComponent('appSections/perspectives/Custom') as any,
    tasks: () => AsyncComponent('appSections/Tasks') as any,
    intervals: () => AsyncComponent('appSections/Intervals') as any,
    settings: () => AsyncComponent('appSections/Settings') as any,
    statistics: () => AsyncComponent('appSections/Statistics') as any,
    routines: () => AsyncComponent('appSections/Routines') as any,
    tags: () => AsyncComponent('appSections/Tags') as any,
    help: () => AsyncComponent('appSections/Help') as any,
    // pop ups
    addtask: () => AsyncComponent('appPopUps/AddTask') as any,
  },
  computed: {
    currentSection(): string {
      return this.$store.state.app.nav.component;
    },
    currentPopUp(): string {
      return this.$store.state.app.nav.popUp;
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
  margin: 0 45px;
  transition: margin .3s;
}

.navOpened {
  margin: 0 40px 0 290px;
}

.perspective {
  margin-top: -25px;
}

#app-pop-ups {
  position: absolute;
  height: 100%;
  width: 100%;
}

#app-pop-up-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
}

.pop-up {
  width: 400px;
  height: 100px;
  background-color: red;
  margin-top: 100px;
}

@media screen and (max-width: 825px) {
  .user-app-content {
    margin: 0 8px;
  }
}

</style>
