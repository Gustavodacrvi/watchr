<template>
  <div id='user-section'>
    <navigation></navigation>
    <div id='user-section-content'>
      <transition name='fade-transition' mode='out-in'>
        <component :is='currentSection'></component>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Navigation from '@/components/sectionNavigation/Navigation.vue';
import LoadingComponent from '@/components/generalComponents/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./../userSections/${component}.vue`).then((m) => m.default),
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
    overview: () => AsyncComponent('Overview') as any,
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
      return this.$store.state.app.section;
    },
  },
});
</script>

<style scoped>

#user-section {
  display: flex;
  justify-content: center;
}

#user-section-content {
  flex-basis: 1526px;
  padding-top: 10px;
  margin: 0 60px;
}

@media screen and (max-width: 825px) {
  #user-section-content {
    margin: 0 8px;
  }
}

</style>
