<template>
  <div class='wrapper gray' :class='theme'>
    <div v-if='isDesktop' class='theappbar'>

    </div>
    <div v-else-if='!isLogged' class='theappbar'>
      <div class='relatives'>
        <div class='auth-banner main-color-card' :class='theme'>
          <button class='auth-button' @click='pushPopUp("SignupPopup")' :class='theme'>SIGN UP</button>
          <button class='auth-button' @click='pushPopUp("SigninPopup")' :class='theme'>SIGN IN</button>
        </div>
        <div class='content'>

        </div>
      </div>
    </div>
    <div v-else-if='!mobileSettingsSection' class='theappbar'>
      
    </div>
    <div v-else class='theappbar'>

    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

@Component
export default class TheNavBar extends Vue {
  @State('theme') public readonly theme!: string
  @State('isLogged') public readonly isLogged!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  public mobileSettingsSection: boolean = false
}

/*
  header:
    not logged mobile, logged mobile and desktop, mobile settings section
 */

</script>

<style scoped>

.theappbar {
  position: relative;
  height: 100%;
}

.relatives {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  flex-basis: 100%;
}

.auth-banner {
  flex-basis: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.auth-button {
  margin: 8px;
  padding: 8px 50px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
}

.auth-button.dark {
  background-color: #A97CFC;
  color: white;
}

.auth-button.light {
  background-color: #F0F0F0;
  color: #8C8C8C;
}

</style>
