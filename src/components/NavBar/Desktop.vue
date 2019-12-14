<template>
  <div class="Desktop">
    <div class="logo" :class="{normal: isntOnIndexPage}">
      <LogoApp :width='isntOnIndexPage ? "30px" : "45px"' :class="{'illustration-colors': isntOnIndexPage}" :trans='true'/>
      <span class="watchr"><b>watchr</b></span>
    </div>
    <router-link class="link" tabindex="-1" :class="{active: isLinkActive('home')}" to="/">{{ l['Home'] }}</router-link>
    <router-link class="link" tabindex="-1" :class="{active: isLinkActive('user')}" to="/user">{{ l['User'] }}</router-link>
    <router-link class="link" tabindex="-1" :class="{active: isLinkActive('support')}" to="/support/overview">{{ l['Support'] }}</router-link>
    <div class="line"></div>
    <div class="icons">
      <DropIcon style="z-index: 3"
        class="drop"
        handle="user"
        handleColor="var(--gray)"
        :circle='true'
        :options="dropLinks"
        @handle-toggle='v => isLinksIconDropOpen = v'
      />
      <DropIcon style="z-index: 2"
        class="drop"
        handle="globe"
        handleColor="var(--gray)"
        :circle='true'
        :options="languages"
        @handle-toggle='v => isLanguagesIconDropOpen = v'
      />
      <VersionApp style="position: relative;z-index: 1"/>
      <ButtonApp v-if="user && user.isAnonymous" class="no-back" :value="l['Sign in']" @click="upgradeUser"/>
    </div>
  </div>
</template>

<script>

import LogoVue from '../Illustrations/Logo.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import ButtonVue from '../Auth/Button.vue'
import VersionApp from '@/components/Version.vue'

import { mapGetters, mapState } from 'vuex'

import firebase from 'firebase/app'

export default {
  components: {
    DropIcon: IconDropVue,
    LogoApp: LogoVue, VersionApp,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      isLinksIconDropOpen: false,
      isLanguagesIconDropOpen: false, 
    }
  },
  props: ['route', 'dropLinks'],
  methods: {
    stopNavHide() {
      this.$store.commit('toggleAllowNavHide', !(this.isLinksIconDropOpen || this.isLanguagesIconDropOpen))
    },
    saveLang(lang) {
      this.$store.commit('saveLang', lang)
    },
    upgradeUser() {
      this.$store.dispatch('pushPopup', {
        comp: 'Signup',
        payload: true,
      })
    },
    isLinkActive(link) {
      if (this.$route.matched.length === 0)
        return link === this.$route.name
      return this.$route.matched.some(route => route.name === link)
    },
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
  },
  watch: {
    isLinksIconDropOpen() {
      this.stopNavHide()
    },
    isLanguagesIconDropOpen() {
      this.stopNavHide()
    },
  }
}

</script>

<style scoped>

.drop {
  margin-left: 14px;
  transform: translateY(6px);
  position: relative;
  z-index: 3;
}

.link {
  text-decoration: none;
  color: var(--gray);
  font-size: 1.05em;
  display: inline-block;
  padding: 0 14px;
  outline: none;
  transition-duration: .15s;
}

.link:hover {
  color: var(--white);
}

.link.active {
  color: var(--primary);
}

.link:active {
  color: var(--gray);
  transform: scale(.9, .9);
}

.line {
  position: absolute;
  background-color: var(--primary);
  border-radius: 50px;
  height: 3px;
  width: 20px;
  bottom: 0;
  transition-duration: .15s;
}

.icons {
  display: inline-flex;
  flex-direction: row-reverse;
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
