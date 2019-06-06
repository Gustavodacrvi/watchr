<template>
  <div class='navbar-wrapper'>
    <div class='navbar'>
      <div class='left'>
      </div>
      <div class='center'>
        <router-link class='link txt' to='/'>Home</router-link>
        <router-link class='link txt' to='/user'>User</router-link>
        <router-link class='link txt' to='/guest'>Guest</router-link>
        <router-link class='link txt' to='/help'>Help</router-link>
      </div>
      <div class='right'>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

export default class TheNavbar extends Vue {

}

</script>

<style scoped>

.navbar-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  padding: 18px 40px;
  box-sizing: border-box;
}

.navbar {
  position: relative;
  height: 100%;
}

.left {
  float: left;
  clear: left;
}

.right {
  float: right;
  clear: right;
}

.center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.link {
  display: inline-block;
  text-decoration: none;
  box-sizing: border-box;
  padding: 9px 12px;
  font-size: 1.1em;
  transition: color .3s;
}

.link:hover, link.active {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
}

</style>
