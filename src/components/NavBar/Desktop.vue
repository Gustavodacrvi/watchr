<template>
  <div class="Desktop">
    <div class="logo" :class="{normal: isntOnIndexPage}">
      <LogoApp :width='isntOnIndexPage ? "30px" : "45px"' :class="{'illustration-colors': isntOnIndexPage}" :trans='true'/>
      <span class="watchr"><b>watchr</b></span>
    </div>
    <router-link class="link" tabindex="-1" :class="{active: route === 'home'}" to="/">{{ l['Home'] }}</router-link>
    <router-link class="link" tabindex="-1" :class="{active: route === 'user'}" to="/user">{{ l['User'] }}</router-link>
    <router-link class="link" tabindex="-1" :class="{active: route === 'about'}" to="/about">{{ l['About'] }}</router-link>
    <div class="line"></div>
    <div class="icons">
      <DropIcon class="drop" handle="user" handleColor="var(--gray)" :options="dropLinks"/>
      <DropIcon class="drop" handle="globe" handleColor="var(--gray)" :options="languages"/>
      <ButtonApp v-if="user && user.isAnonymous" class="no-back" :value="l['Sign in']" @click="upgradeUser"/>
    </div>
  </div>
</template>

<script>

import LogoVue from '../Illustrations/Logo.vue'
import IconDropVue from '../IconDrop.vue'
import ButtonVue from '../Auth/Button.vue'

import { mapGetters, mapState } from 'vuex'

import firebase from 'firebase/app'

export default {
  components: {
    DropIcon: IconDropVue,
    LogoApp: LogoVue,
    ButtonApp: ButtonVue,
  },
  props: ['route', 'dropLinks'],
  methods: {
    saveLang(lang) {
      this.$store.commit('saveLang', lang)
    },
    upgradeUser() {
      this.$store.dispatch('pushPopup', {
        comp: 'Signup',
        payload: true,
      })
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['l']),
    isntOnIndexPage() {
      return this.$route.path !== '/'
    },
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

.logo {
  position: absolute;
  left: 34px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  opacity: 1;
  align-items: center;
  transition: opacity .3s;
  pointer-events: none;
}

.watchr {
  margin-left: 6px;
  font-size: 1.6em;
  transform: translateY(0px);
  transition-duration: .3s;
}

.normal .watchr {
  transform: translateY(-80px);
}

.normal {
  opacity: .6;
}

</style>
