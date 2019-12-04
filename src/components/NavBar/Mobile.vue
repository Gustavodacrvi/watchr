<template>
  <div class="Mobile">
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
            @touchend.stop
          >
            <template v-if="showHelpIcons">
              <transition-group name='fade-t'>
                <Icon v-for="i in navBar.options.icons" :key="i.icon"
                  class="cursor option-icon"
                  color='var(--gray)'
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
              handle-color="var(--gray)"
              :circle='true'
              width="100px"
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
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import LogoVue from '../Illustrations/Logo.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    LogoApp: LogoVue,
  },
  methods: {
    openMenu() {
      setTimeout(() => {
        this.$router.push({path: '/menu'})
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
      if (this.$route.name === 'user') {
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
      return this.$route.name === 'user' || this.$route.path === '/menu'
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
  transition: opacity .3s;
}

</style>
