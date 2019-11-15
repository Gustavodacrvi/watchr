<template>
  <div class="Menu cbd">
    <div class="appbar-wrapper">
      <span @click="closeMenu">
        <Icon class="arrow cursor" icon="arrow" color="var(--gray)" width="25px" :primaryHover="true"/>
      </span>
      <transition :name="this.appSection ? 'mr' : 'ml'">
        <Appbar class="Appbar" v-if="appSection" key="app"/>
        <div v-else key="links" class="nav-links">
          <router-link class="cursor link rb" to="/">{{ l['Home'] }}</router-link>
          <router-link class="cursor link rb" to="/user">{{ l['User'] }}</router-link>
          <router-link class="cursor link rb" to="/support/overview">{{ l['Support'] }}</router-link>
          <span class="cursor link rb" @click="pop('Signin')">{{ l['Sign in'] }}</span>
          <span class="cursor link rb" @click="pop('Signup')">{{ l['Sign up'] }}</span>
          <span v-if="user && user.isAnonymous" class="cursor link rb" @click="$store.dispatch('logOut')">{{ l['Log out'] }}</span>
        </div>
      </transition>
    </div>
    <Icon class="cursor user" icon="user" color="var(--gray)" :primaryHover="true" @click="toggleMenu"/>
    <IconDrop v-if="!appSection"
      class="drop rigth"
      handle="globe"
      handleColor="var(--gray)"
      :options='languages'
    />
  </div>
</template>

<script>

import AppbarVue from '../Appbar/Appbar.vue'
import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Appbar: AppbarVue,
    Icon: IconVue,
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
    goback() {
      this.$emit('close-menu')
      this.$router.go(-1)
    }
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

.Menu {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  z-index: 498;
  overflow: hidden;
}

.drop {
  position: absolute;
  right: 8px;
  bottom: 8px;
}

.appbar-wrapper {
  position: relative;
  margin: 16px;
  height: 100%;
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
