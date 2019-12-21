<template>
  <div class="Mobile"
    @touchstart.passive='touchstart'
    @touchmove.prevent='touchmove'
    @touchend.passive='touchend'
  >
    <div class="mobile-wrapper">
      <div class="search" ref="search">
        <Icon class="cursor remove-highlight"
          icon="search"
          @click="openSearchBar"
          :circle="true"
        />
      </div>
      <div class="central">
        <span @click="openMenu">
          <Icon class="primary-hover cursor" icon="menu" width="22px" :circle="true"/>
        </span>
        <transition name="fade" mode="out-in" appear>
          <div v-if="isNotOnHome" key="user">
            <span v-if="title" class="title">{{ title }}</span>
            <div class="drop"
              @click.stop
              @pointerup.stop
              @mouseup.stop
              @touchend.stop.passive
            >
              <template v-if="showHelpIcons">
                <transition-group name='fade'>
                  <Icon v-for="i in navBar.options.icons" :key="i.icon"
                    class="cursor option-icon remove-highlight"
                    color='var(--white)'
                    width='22px'
                    :icon='i.icon'
                    :circle="true"
                    @click="openCallback(i.callback)"
                  />
                </transition-group>
              </template>
              <IconDrop v-if="showIcons && navBar.options.icondrop"
                handle="settings-v"
                :options="navBar.options.icondrop"
                handle-color="var(--white)"
                :circle='true'
              />
            </div>
          </div>
          <div v-else class="logo cursor" @click="goToIndexPage" key="notuser">
            <span class="watchr"><b>watchr</b></span>
            <LogoApp width="35px"/>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import LogoVue from '../Illustrations/Logo.vue'

import { mapState, mapGetters } from 'vuex'

const MAXIMUM_TOUCH_DISTANCE = 125

export default {
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    LogoApp: LogoVue,
  },
  data() {
    return {
      y: 0,
    }
  },
  methods: {
    touchstart(evt) {
      this.y = evt.touches[0].screenY
    },
    move(x, transition) {
      if (x > MAXIMUM_TOUCH_DISTANCE) return undefined
      const s = this.$refs.search.style

      const getOpacity = () =>  x / MAXIMUM_TOUCH_DISTANCE
      const getTransform = () => {
        const scale = 1 + (.6 * x / MAXIMUM_TOUCH_DISTANCE)
        return `translateY(${x}px) scale(${scale}, ${scale})`
      }

      /*

        1.4  -   100
        x    -    d

        x100 = 1.4 d

        x = 1.4 .d / 100
        
      */
      
      if (!transition) {
        s.transform = getTransform()
        s.opacity = getOpacity()
      }
    },
    touchmove(evt) {
      const diff = evt.touches[0].screenY - this.y

      this.move(diff)
    },
    touchend() {
      this.move(0)
    },
    
    openMenu() {
      setTimeout(() => {
        this.$router.push({path: '/menu'})
      })
    },
    openSearchBar() {
      this.$store.commit('openFastSearch')
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
    ...mapState({
      navBar: state => state.navBar,
      invites: state => state.list.invites,
      selectedTasks: state => state.selectedTasks,
    }),
    ...mapGetters(['l']),
    showIcons() {
      return this.isOnUserPage && this.navBar && this.navBar.options
    },
    showHelpIcons() {
      return this.showIcons && this.isSelectingTask
    },
    isSelectingTask() {
      return this.selectedTasks && this.selectedTasks.length > 0
    },
    title() {
      if (this.isOnUserPage) {
        if (this.navBar) return this.navBar.title
        else return null
      }
      return this.viewTitle
    },
    isNotOnHome() {
      return this.$route.name !== 'home'
    },
    viewTitle() {
      const n = this.$route.name
      switch (n) {
        case 'profile': return this.l['Profile']
        case 'collaborators': return this.l['Collaborators']
      }
    },
    isOnUserPage() {
      const isInUser = this.$route.name === 'user'
      const isInMenu = this.$route.path === '/menu'
      const isInPopup = this.$route.path === '/popup'
      
      return isInUser || isInPopup || isInMenu
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

.search {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;
  top: -20px;
  opacity: 0;
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
  right: 14px;
  align-items: center;
  transform: translateY(-22px);
}

.option-icon {
  margin-right: 12px;
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
