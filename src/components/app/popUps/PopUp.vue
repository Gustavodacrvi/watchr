<template>
  <div id='app-pop-ups' class='reduced-brightness'>
    <div id='app-pop-up-wrapper' :class='{"pop-up-opened": popUpOpened}'>
      <transition name='fade-transition' mode='out-in'>
        <component class='pop-up card-round' :is='currentPopUp'></component>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LoadingComponent from '@/components/regular/Loading.vue';

const AsyncComponent = (component: string) => ({
  component: import(`./${component}.vue`).then((m) => m.default),
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000,
});

export default Vue.extend({
  components: {
    addlabel: () => AsyncComponent('AddLabel') as any,
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
  height: 110%;
  width: 100%;
  pointer-events: none;
}

.pop-up {
  margin: 0 6px;
  margin-top: 75px;
}

.pop-up-opened {
  background-color: rgba(0, 0, 0, .3);
  pointer-events: initial !important;
}

#app-pop-up-wrapper {
  position: relative;
  height: 125%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

</style>

