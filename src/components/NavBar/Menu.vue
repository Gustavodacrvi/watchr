<template>
  <div class="Menu cbd">
    <div class="sidebar-wrapper">
      <span class="arrow-wrapper">
        <Icon @click="closeMenu" class="arrow primary-hover cursor" icon="arrow" color="var(--fade)" width="25px"/>
        <div>
          <Icon class="cursor help-icon primary-hover" icon="user" color="var(--fade)" @click="toggleMenu"/>
          <VersionApp class="version"/>
        </div>
      </span>
      <transition :name="this.appSection ? 'mr' : 'ml'">
        <Sidebar class="Sidebar" v-if="appSection" key="app"/>
        <div v-else key="links" class="nav-links">
          <router-link class="cursor link rb" to="/">Home</router-link>
          <router-link class="cursor link rb" to="/user">User</router-link>
          <router-link class="cursor link rb" to="/support/overview">Support</router-link>
          <span class="cursor link rb" @click="pop('Signin')">Sign in</span>
          <span class="cursor link rb" @click="pop('Signup')">Sign up</span>
          <span class="cursor link rb" @click="profile" @click.stop @touchstart.stop.passive>Profile</span>
          <span v-if="user && user.isAnonymous" class="cursor link rb" @click="$store.dispatch('logOut')">Log out</span>
        </div>
      </transition>
      <ActionButtons class="action-buttons" v-if="appSection" :menu='true'/>
    </div>
  </div>
</template>

<script>

import SidebarVue from '../Sidebar/Sidebar.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import VersionApp from '@/components/Version.vue'
import ActionButtons from '@/components/View/FloatingButtons/ActionButtons.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    ActionButtons,
    Sidebar: SidebarVue,
    VersionApp,
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
      this.$store.dispatch('pushPopup', {
        comp: 'Profile'
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
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isDesktopBreakPoint']),
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

.sidebar-wrapper {
  position: relative;
  height: 100%;
}

.Sidebar {
  margin-top: 8px;
}

.action-buttons {
  margin-right: 6px;
}

.help-icon {
  transform: translate(-9px, -7px);
}

.drop {
  margin-left: 8px;
  display: inline-block;
}

.arrow {
  transform: rotate(90deg);
  margin-bottom: 6px;
}

.link {
  text-decoration: none;
  display: flex;
  align-items: center;
  color: var(--txt);
  height: 35px;
  transition-duration: .3s;
  padding: 0 6px;
}

.link:hover {
  background-color: var(--light-gray);
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
