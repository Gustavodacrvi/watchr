<template>
  <div>
    <navigation></navigation>
    <component :is='currentSection'></component>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Navigation from './../sectionNavigation/Navigation.vue';
import LoadingComponent from './../generalComponents/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./../userSections/${component}.vue`).then((m) => m.default),
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000,
});

export default Vue.extend({
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

</style>
