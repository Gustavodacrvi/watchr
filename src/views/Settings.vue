<template>
  <div class='settings background-color' :class='theme'>
    <div class='center'>
      <div class='fake-menu'></div>
      <div class='menu-wrapper' :class='theme'>
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
          <div class='margin'></div>
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
      </div>
      <div class='text txt'>
        <transition name='fade' mode='out-in'>
          <router-view/>
        </transition>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
        <div class='margin'></div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class Help extends Vue {
  @State theme!: string
}

</script>

<style scoped>

.settings {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.center {
  flex-basis: 1000px;
  margin: 0 10px;
  margin-top: 60px;
  display: flex;
  align-items: flex-start;
}

.text {
  flex-basis: 775px;
  text-align: justify;
  text-justify: inter-word;
}

.menu-wrapper {
  position: fixed;
  flex-basis: 225px;
}

.fake-menu {
  flex-basis: 225px;
}

.menu-wrapper.dark {
  border-left: 2px solid #292929;
}

.menu-wrapper.light {
  border-left: 2px solid #D9D9D9;
}

.menu {
  position: relative;
  left: -1px;
}

.margin {
  height: 25px;
}

.el {
  display: block;
  padding: 6px;
  padding-left: 12px;
  text-decoration: none;
  font-size: 1.1em;
  transition: color .3s, border .3s, padding .3s;
}

.el:hover, .el.router-link-exact-active {
  color: #fc7d7d;
  border-left: 2px solid #fc7d7d;
  position: relative;
  left: -1px;
  padding-left: 13px;
}

</style>
