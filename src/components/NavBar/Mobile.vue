<template>
  <div class="Mobile">
    <div class="central">
      <Icon class="cursor" icon="menu" width="30px" :primaryHover="true" @click="openMenu"/>
      <transition name="fade" mode="out-in" appear>
        <div v-if="isOnUserPage" key="user">
          <h2 v-if="navBar && navBar.title" class="title">{{ navBar.title }}</h2>
          <IconDrop v-if="navBar && navBar.options"
            handle="settings-v"
            :options="navBar.options"
            handle-color="var(--gray)"
            width="100px"
          />
        </div>
        <div v-else class="logo cursor" @click="goToIndexPage" key="notuser">
          <span class="watchr"><b>watchr</b></span>
          <LogoApp width="35px"/>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'
import LogoVue from '../Illustrations/Logo.vue'

import { mapState } from 'vuex'

export default {
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    LogoApp: LogoVue,
  },
  methods: {
    openMenu() {
      this.$router.push('/menu')
    },
    goToIndexPage() {
      this.$router.push('/')
    }
  },
  computed: {
    ...mapState(['navBar']),
    isOnUserPage() {
      return this.$route.name === 'user'
    }
  }
}

</script>

<style scoped>

.Mobile {
  width: 100%;
  height: 100%;
  padding: 0 16px;
}

.Icon {
  transition-duration: .2s;
}

.IconDrop {
  position: absolute;
  right: 6px;
  transform: translateY(-17px);
}

.central {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.title {
  display: inline-block;
  margin: 0;
  margin-left: 10px;
  transform: translateY(-2.5px);
}

.logo {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.watchr {
  font-size: 1.6em;
  margin-right: 8px;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transition: opacity .3s;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
  transition: opacity .3s;
}

</style>
