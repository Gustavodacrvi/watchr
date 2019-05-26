<template>
  <div id='user-app'>
    <navigation></navigation>
    <div class='user-app-content' :class='{navOpened: $store.state.app.nav.open}'>
      <transition name='fade-transition' mode='out-in'>
        <component class='perspective' :is='currentSection'></component>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Navigation from '@/components/app/navigation/Navigation.vue';
import LoadingComponent from '@/components/regular/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./sections/${component}.vue`).then((m) => m.default),
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000,
});

export default Vue.extend({
  components: {
    navigation: Navigation,
    anytime: () => AsyncComponent('overview/Anytime') as any,
    inbox: () => AsyncComponent('overview/Inbox') as any,
    someday: () => AsyncComponent('overview/Someday') as any,
    today: () => AsyncComponent('overview/Today') as any,
    upcoming: () => AsyncComponent('overview/Upcoming') as any,
    custom: () => AsyncComponent('perspectives/Custom') as any,
    tasks: () => AsyncComponent('Tasks') as any,
    intervals: () => AsyncComponent('Intervals') as any,
    settings: () => AsyncComponent('Settings') as any,
    statistics: () => AsyncComponent('Statistics') as any,
    routines: () => AsyncComponent('Routines') as any,
    tags: () => AsyncComponent('Tags') as any,
    help: () => AsyncComponent('Help') as any,
  },
  props: {
    webStorage: Boolean,
  },
  data() {
    return {
      keys: [] as string[],
    };
  },
  created() {
    if (this.webStorage) {
      this.$store.commit('app/useWebStorage', true);
    } else {
      this.$store.commit('app/useWebStorage', false);
    }
    window.addEventListener('keydown', this.openPopUp);
  },
  methods: {
    openPopUp(event: any) {
      this.keys.push(event.key);
      setTimeout(() => {
        this.keys = [];
      }, 300);
      if (this.keys.length === 2) {
        this.$store.dispatch('app/nav/doubleKeypress', this.keys);
      }
    },
  },
  computed: {
    currentSection(): string {
      return this.$store.state.app.nav.component;
    },
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.openPopUp);
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
  margin: 0 80px;
  transition: margin .3s;
}

.navOpened {
  margin: 0 40px 0 290px;
}

.perspective {
  margin-top: -25px;
}

@media screen and (max-width: 1025px) {
  .user-app-content {
    margin: 0 8px;
  }
}

</style>
