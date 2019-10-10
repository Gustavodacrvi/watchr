<template>
  <div class="Mobile">
    <div class="central">
      <span class="cursor" @click="openMenu">
        <Icon icon="menu" width="30px" :primaryHover="true"/>
      </span>
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
  data() {
    return {
      click: false,
    }
  },
  methods: {
    openMenu() {
<<<<<<< HEAD
      this.$emit('open-menu')
      this.$router.push('/menu')
=======
      this.click = !this.click
      setTimeout(() => {
        this.$router.push({path: '/menu'})
      })
>>>>>>> 91cca45f11f479ff53ab837d44141090ee679b6c
    },
    goToIndexPage() {
      this.$router.push('/')
    }
  },
  computed: {
    ...mapState(['navBar']),
    isOnUserPage() {
      return this.$route.name === 'user' || this.$route.path === '/menu'
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
