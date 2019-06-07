<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar'>
          <the-nav-bar></the-nav-bar>
        </div>
        <router-view class='content' />
        <transition name='fade'>
          <div v-if='showingPopUp' class='pop-ups'>
            <component :is='popUp'></component>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TheNavbar from '@/components/TheNavbar.vue'

@Component({
  components: {
    'the-nav-bar': TheNavbar,
    'SigninPopup': () => import('@/components/PopUps/SigninPopup.vue'),
    'SignupPopup': () => import('@/components/PopUps/SignupPopup.vue'),
  },
})
export default class App extends Vue {
  @State('theme') private theme!: string
  @State('popUpComponent') private popUp!: string

  get showingPopUp(): boolean {
    return this.popUp !== ''
  }
}

</script>


<style scoped>

.app-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
}

.visible {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pop-ups {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, .5);
  transition: background-color .3s; 
}

.navbar {
  position: relative;
  width: 100%;
  flex-basis: 80px;
}

.content {
  position: relative;
  flex-basis: 100%;
}

</style>

<style>

@import 'assets/css/global.css';

</style>
