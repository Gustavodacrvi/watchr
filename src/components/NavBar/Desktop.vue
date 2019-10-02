<template>
  <div class="Desktop">
    <router-link class="link" :class="{active: route === 'home'}" to="/">{{ l['Home'] }}</router-link>
    <router-link class="link" :class="{active: route === 'user'}" to="/user">{{ l['User'] }}</router-link>
    <router-link class="link" :class="{active: route === 'about'}" to="/about">{{ l['About'] }}</router-link>
    <div class="line"></div>
    <div class="icons">
      <DropIcon class="drop" handle="user" handleColor="var(--gray)" :options="dropLinks"/>
      <DropIcon class="drop" handle="globe" handleColor="var(--gray)" :options="languages"/>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import IconDropVue from '../IconDrop.vue'

export default {
  components: {
    DropIcon: IconDropVue,    
  },
  props: ['route', 'dropLinks'],
  methods: {
    saveLang(lang) {
      this.$store.commit('saveLang', lang)
    },
  },
  computed: {
    ...mapGetters(['l']),
    languages() {
      return [
        {
          name: 'English',
          callback: () => this.saveLang('en'),
        },
        {
          name: 'Português(Brasil)',
          callback: () => this.saveLang('pt-br'),
        },
      ]
    },
  }
}

</script>

<style scoped>

.drop {
  margin-left: 14px;
}

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
