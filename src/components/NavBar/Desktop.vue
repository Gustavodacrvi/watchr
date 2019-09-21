<template>
  <div class="Desktop">
    <router-link class="link" :class="{active: route === 'home'}" to="/">Home</router-link>
    <router-link class="link" :class="{active: route === 'user'}" to="/user">User</router-link>
    <router-link class="link" :class="{active: route === 'about'}" to="/about">About</router-link>
    <div class="line"></div>
    <div class="icons">
      <DropIcon handle="user" handleColor="var(--gray)" :options="dropLinks"/>
    </div>
  </div>
</template>

<script>

import IconDropVue from '../IconDrop.vue'

export default {
  components: {
    DropIcon: IconDropVue,    
  },
  props: ['route', 'dropLinks'],
}

</script>

<style scoped>

.link {
  text-decoration: none;
  color: var(--white);
  font-size: 1.05em;
  display: inline-block;
  padding: 0 14px;
  transition-duration: .2s;
}

.link.active, .link:hover {
  color: var(--primary);
}

.line {
  position: absolute;
  background-color: var(--primary);
  border-radius: 2px;
  height: 3px;
  width: 50px;
  bottom: 0;
  transition-duration: .2s;
}

.icons {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
}

</style>
