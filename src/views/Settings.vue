<template>
  <div class='settings'>
    <div class='center'>
      <div class='menu'>
        <router-link
          class='txt el'
          ref='About'
          :to="{name: 'About'}"
        >About</router-link>
        <router-link
          class='txt el'
          ref='General'
          :to="{name: 'General'}"
        >General</router-link>
        <router-link
          class='txt el'
          ref='Privacy policy'
          :to="{name: 'Privacy policy'}"
        >Privacy policy</router-link>
        <router-link
          class='txt el'
          ref='Security policy'
          :to="{name: 'Security policy'}"
        >Security policy</router-link>
        <router-link
          class='txt el'
          ref='Terms of service'
          :to="{name: 'Terms of service'}"
        >Terms of service</router-link>
      </div>
      <div class='text txt'>
        <transition name='fade' mode='out-in'>
          <router-view/>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Help extends Vue {}

</script>

<style scoped>

.settings {
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
}

.center {
  flex-basis: 1000px;
  margin: 0 10px;
  margin-top: 60px;
  display: flex;
}

.menu {
  flex-basis: 225px;
}

.text {
  flex-basis: 775px;
  text-align: justify;
  text-justify: inter-word;
}

</style>
