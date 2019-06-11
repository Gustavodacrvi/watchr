<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar'>
          <the-nav-bar></the-nav-bar>
        </div>
        <router-view class='content' />
        <div v-show='showingPopUp' class='pop-ups'>
          <transition name='fade' mode='out-in'>
            <component class='pop-up' :is='popUp'></component>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TheNavbar from '@/components/TheNavbar/TheNavbar.vue'

@Component({
  components: {
    'the-nav-bar': TheNavbar,
    'SigninPopup': () => import('@/components/PopUps/SigninPopup.vue'),
    'SignupPopup': () => import('@/components/PopUps/SignupPopup.vue'),
  },
})
export default class App extends Vue {
  @State('theme') private readonly theme!: string
  @State('popUpComponent') private readonly popUp!: string

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
  background-color: rgba(0, 0, 0, .2);
  transition: background-color .3s; 
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pop-up {
  margin-top: 100px;
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
