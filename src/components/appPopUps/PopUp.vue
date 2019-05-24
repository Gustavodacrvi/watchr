<template>
  <div id='app-pop-ups' class='reduced-brightness' :class='{"pop-up-opened": popUpOpened}'>
    <div id='app-pop-up-wrapper'>
      <transition name='fade-transition' mode='out-in'>
        <component class='pop-up' :is='currentPopUp'></component>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LoadingComponent from '@/components/generalComponents/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./../${component}.vue`).then((m) => m.default),
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000,
});

export default Vue.extend({
  components: {
    addlabel: () => AsyncComponent('appPopUps/AddLabel') as any,
  },
  computed: {
    popUpOpened(): boolean {
      return this.$store.state.app.nav.popUp !== '';
    },
    currentPopUp(): string {
      return this.$store.state.app.nav.popUp;
    },
  },
});
</script>

<style scoped>

#app-pop-ups {
  position: absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
}

.pop-up {
  margin-top: 100px;
}

.pop-up-opened {
  background-color: rgba(0, 0, 0, .5);
  pointer-events: initial !important;
}

#app-pop-up-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

</style>

