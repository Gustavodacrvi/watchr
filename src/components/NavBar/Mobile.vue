<template>
  <div class="Mobile">
    <div class="mobile-wrapper">
      <div class="central">
        <span @click="openMenu">
          <Icon class="primary-hover cursor" icon="menu" width="22px" :circle="true"/>
        </span>
        <div class="logo cursor" @click="goToIndexPage" key="notuser">
          <span class="watchr"><b>watchr</b></span>
          <LogoApp width="35px"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import LogoVue from '../Illustrations/Logo.vue'

import utils from '@/utils'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['route'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    LogoApp: LogoVue,
  },
  methods: {
    openMenu() {
      setTimeout(() => {
        this.$router.push('/menu')
      })
    },
    goToIndexPage() {
      this.$router.push('/')
    },
    openCallback(callback) {
      const res = callback()
      if (res)
        this.$store.commit('pushIconDrop', res)
    },
  },
  computed: {
    ...mapGetters(['l']),
    title() {
      return this.$route.name
    },
  }
}

</script>

<style scoped>

.Mobile {
  width: 100%;
  height: 100%;
  padding: 0 16px;
}

.mobile-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.cont-wrapper {
  display: flex;
  align-items: center;
}

.Icon {
  transition-duration: .15s;
}

.msg {
  margin-right: 4px;
  transform: translateY(4px);
}

.drop {
  position: absolute;
  display: flex;
  right: 0;
  align-items: center;
}

.option-icon {
  margin-right: 24px;
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
  font-size: 1.15em;
  transform: translateY(-2.5px);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  transition: opacity .2s;
}

</style>
