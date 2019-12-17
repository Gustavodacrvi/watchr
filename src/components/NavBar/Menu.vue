<template>
  <div class="Menu cbd">
    <div class="appbar-wrapper">
      <span class="arrow-wrapper" @click="closeMenu">
        <Icon class="arrow primary-hover cursor" icon="arrow" color="var(--gray)" width="25px" :circle='true'/>
        <VersionApp class="version"/>
      </span>
      <transition :name="this.appSection ? 'mr' : 'ml'">
        <Appbar class="Appbar" v-if="appSection" key="app"/>
        <div v-else key="links" class="nav-links">
          <router-link class="cursor link rb" to="/">{{ l['Home'] }}</router-link>
          <router-link class="cursor link rb" to="/user">{{ l['User'] }}</router-link>
          <router-link class="cursor link rb" to="/support/overview">{{ l['Support'] }}</router-link>
          <span class="cursor link rb" @click="pop('Signin')">{{ l['Sign in'] }}</span>
          <span class="cursor link rb" @click="pop('Signup')">{{ l['Sign up'] }}</span>
          <span class="cursor link rb" @click="profile" @click.stop @touchstart.stop.passive>{{ l["Profile"] }}</span>
          <span v-if="user && user.isAnonymous" class="cursor link rb" @click="$store.dispatch('logOut')">{{ l['Log out'] }}</span>
        </div>
      </transition>
    </div>
    <Icon class="cursor user primary-hover" icon="user" color="var(--gray)" @click="toggleMenu" :circle='true'/>
    <IconDrop v-if="!appSection"
      class="drop rigth"
      handle="globe"
      :circle='true'
      handleColor="var(--gray)"
      :options='languages'
    />
  </div>
</template>

<script>

import AppbarVue from '../Appbar/Appbar.vue'
import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import VersionApp from '@/components/Version.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Appbar: AppbarVue,
    Icon: IconVue, VersionApp,
    IconDrop: IconDropVue
  },
  data() {
    return {
      appSection: true,
    }
  },
  methods: {
    toggleMenu() {
      this.appSection = !this.appSection
    },
    profile() {
      this.$store.commit('pushIconDrop', {
        comp: 'Profile',
        content: {},
      })
    },
    pop(comp) {
      this.$store.dispatch('pushPopup', {comp})
    },
    closeMenu() {
      setTimeout(() => {
        this.$router.go(-1)
      })
    },
    saveLang(lang) {
      this.$store.commit('saveLang', lang)
    },
  },
  computed: {
    ...mapState(['user']),
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

.version {
  transform: translate(0px, -2px);
}

.nav-links {
  margin: 16px;
}

.arrow-wrapper {
  display: flex;
  justify-content: space-between;
  margin: 16px;
  margin-bottom: 0;
}

.Menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  z-index: 497;
  overflow: hidden;
}

.appbar-wrapper {
  position: relative;
  height: 100%;
}

.drop {
  position: absolute;
  right: 8px;
  bottom: 8px;
}

.Appbar {
  margin-top: 8px;
}


.arrow {
  transform: rotate(90deg);
  margin-bottom: 6px;
}

.link {
  text-decoration: none;
  display: flex;
  align-items: center;
  color: var(--white);
  height: 35px;
  transition-duration: .3s;
  padding: 0 6px;
}

.link:hover {
  background-color: var(--light-gray);
}

.user {
  position: absolute;
  bottom: 16px;
  left: 16px;
}

.mr-enter-active, .mr-leave-active, .ml-enter-active, .ml-leave-active {
  transition-duration: .3s;
  position: absolute;
  width: 100%;
}

.mr-enter, .ml-leave {
  transform: translateX(100px);
  opacity: 0;
}

.mr-enter-to, .mr-leave, .ml-enter, .ml-leave-to {
  transform: translateX(0);
  opacity: 1;
}

.mr-leave, .ml-enter {
  transform: translateX(-100px);
  opacity: 0;
}

</style>
