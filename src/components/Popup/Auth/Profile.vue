<template>
  <div class="popup cb shadow rb Profile scroll-thin" :class="platform">
    <div class="nav-wrapper">
      <div class="nav">
        <div>
          <div v-if="!isDesktop" style="height: 30px"></div>
          <span class="option rb cursor remove-highlight" :class="{active: 'General' === option}" @click="option = 'General'">General
            <CircleBubble
              innerColor='var(--light-gray)'
              outerColor='var(--fade)'
              opacity='0'
            />
          </span>
          <span class="option rb cursor remove-highlight" :class="{active: 'Sidebar' === option}" @click="option = 'Sidebar'">Sidebar
            <CircleBubble
              innerColor='var(--light-gray)'
              outerColor='var(--fade)'
              opacity='0'
            />
          </span>
        </div>
        <div>
          <transition name="btn-trans">
            <div v-if="changedOptions" class="btn-wrapper">
              <AuthButton class="button"
                type='card'
                value='Save options'
                @click="save"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="cont-wrapper">
      <div class="cont">
        <transition name="fade-t" mode="out-in">
          <div v-if="option === 'General'" class="General" key="general">
            <div>
              <AuthButton
                type="card"
                :class="{white: user.displayName}"
                style='margin-top: 0'
                :value="displayName"
                @click="addDisplayName"
              />
            </div>
            <div>
              <AuthButton
                type="card"
                class="white"
                style='margin-top: 0'
                :value="user.email"
                @click="changeEmail"
              />
            </div>
            <h4 class="title">Options</h4>
            <CheckboxApp class="rb"
              :name='l["Use 1:00pm format"]'
              :value='pmFormat'
              @input="togglepmFormat"
            />
            <CheckboxApp class="rb"
              name='Group folder/list tasks in headings on Today, Tomorrow and Calendar smart views.'
              :value='!ungroupTasksInHeadings'
              @input="ungroupTasksInHeadings = !ungroupTasksInHeadings"
            />
            <h3 class="title">View</h3>
            <CheckboxApp class="rb"
              :name='l["Always open tag filters"]'
              :value='tagFilters'
              @input="toggleTagFilters"
            />
            <CheckboxApp class="rb"
              :name='l["Always open list filters"]'
              :value='listFilters'
              @input="toggleListFilters"
            />
            <CheckboxApp class="rb"
              :name='l["Always open folder filters"]'
              :value='folderFilters'
              @input="toggleFolderFilters"
            />
          </div>
          <div v-else class="Sidebar" key="sidebar">
            <h4 class="title">Options</h4>
            <CheckboxApp class="rb"
              :name='l["Go to the last visited view on app start instead of the first smart view"]'
              :value='goToLastViewOnEnter'
              @input="toggleGoToLastViewOnEnter"
            />
            <h4 class="title">Enabled Sections</h4>
            <CheckboxApp v-for="s in sections" :key="s.name"
              class="rb"
              :name="l[s.name]"
              :value='!isHided(s.name)'
              :icon='s.icon'
              :color='s.color'
              @input='toggleSection(s.name)'
            />
            <h4 class="title">Enabled Smart Views</h4>
            <CheckboxApp v-for="s in sidebarSmartViews" :key="s.name"
              class="rb"
              :name="l[s.name]"
              :value='!isSmartViewHided(s.name)'
              :icon='s.icon'
              :color='s.color'
              @input='toggleSmartView(s.name)'
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>

import AuthButton from '@/components/Auth/Button.vue'
import CheckboxApp from '@/components/Auth/Checkbox.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    AuthButton, CheckboxApp,
  },
  data() {
    return {
      option: 'General',

      sections: [
        {
          name: 'Lists',
          icon: 'tasks',
          color: 'var(--primary)'
        },
        {
          name: 'Tags',
          icon: 'tag',
          color: 'var(--red)'
        },
        /* {
          name: 'Filters',
          icon: 'filter',
          color: 'var(--dark-blue)'
        } */
      ],
      sidebarSmartViews: [
        {
          name: 'Today',
          icon: 'star',
          color: 'var(--yellow)'
        },
        {
          name: 'Tomorrow',
          icon: 'sun',
          color: 'var(--orange)'
        },
        {
          name: 'Inbox',
          icon: 'inbox',
          color: 'var(--primary)'
        },
        {
          name: 'Upcoming',
          icon: 'calendar',
          color: 'var(--green)'
        },
        {
          name: 'Anytime',
          icon: 'layer-group',
          color: 'var(--dark-blue)',
        },
        {
          name: 'Someday',
          icon: 'archive',
          color: 'var(--brown)'
        },
        {
          name: 'Pomodoro',
          icon: 'pomo',
          color: 'var(--dark-red)'
        },
        {
          name: 'Calendar',
          icon: 'calendar-star',
          color: 'var(--purple)'
        },
        {
          name: 'Completed',
          icon: 'circle-check',
          color: 'var(--olive)'
        },
        {
          name: 'Statistics',
          icon: 'pie',
          color: 'var(--primary)'
        },
      ],
      hidedSections: [],
      hidedSmartViews: [],
      pmFormat: true,
      ungroupTasksInHeadings: false,
      goToLastViewOnEnter: false,
      changedSection: false,
      forceUpdate: false,

      folderFilters: false,
      tagFilters: false,
      listFilters: false,
    }
  },
  created() {
    this.update()
  },
  methods: {
    toggleTagFilters() {
      this.tagFilters = !this.tagFilters
    },
    toggleFolderFilters() {
      this.folderFilters = !this.folderFilters
    },
    toggleListFilters() {
      this.listFilters = !this.listFilters
    },
    
    toggleGoToLastViewOnEnter() {
      this.goToLastViewOnEnter = !this.goToLastViewOnEnter
    },
    togglepmFormat() {
      this.pmFormat = !this.pmFormat
    },
    toggleSection(name) {
      this.changedSection = true
      if (this.isHided(name)) {
        const i = this.hidedSections.findIndex(el => el === name)
        this.hidedSections.splice(i, 1)
      } else this.hidedSections.push(name)
    },
    isHided(name) {
      return this.hidedSections.includes(name)
    },
    toggleSmartView(name) {
      this.changedSection = true
      if (this.isSmartViewHided(name)) {
        const i = this.hidedSmartViews.findIndex(el => el === name)
        this.hidedSmartViews.splice(i, 1)
      } else this.hidedSmartViews.push(name)
    },
    isSmartViewHided(name) {
      return this.hidedSmartViews.includes(name)
    },
    reload() {
      window.location.reload()
    },
    changeEmail() {
      this.pop({
        comp: 'ChangeEmail',
        callback: this.reload,
      })
    },
    pop(popup) {
      this.$store.dispatch('pushPopup', popup)
    },
    addDisplayName() {
      this.pop({
        comp: 'ChangeUsername',
        callback: this.reload,
      })
    },
    save() {
      localStorage.setItem('goToLastViewOnEnter', this.goToLastViewOnEnter)
      localStorage.setItem('tagFilters', this.tagFilters)
      localStorage.setItem('listFilters', this.listFilters)
      localStorage.setItem('folderFilters', this.folderFilters)

      this.$store.dispatch('setInfo', {
        disablePmFormat: !this.pmFormat,
        hidedSections: this.hidedSections || null,
        hidedViews: this.hidedSmartViews || null,
        ungroupTasksInHeadings: this.ungroupTasksInHeadings || null,
      })
      this.changedSection = false
      this.forceUpdate = !this.forceUpdate
    },
    update() {
      this.ungroupTasksInHeadings = this.userInfo.ungroupTasksInHeadings
      this.pmFormat = this.getPmFormat
      this.goToLastViewOnEnter = localStorage.getItem('goToLastViewOnEnter') === 'true'
      this.tagFilters = localStorage.getItem('tagFilters') === 'true'
      this.folderFilters = localStorage.getItem('folderFilters') === 'true'
      this.listFilters = localStorage.getItem('listFilters') === 'true'
      this.hidedSections = this.userHidedSections
      this.hidedSmartViews = this.userHidedSmartViews
    },
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop', 'l']),
    ...mapState(['user', 'userInfo']),
    changedOptions() {
      this.forceUpdate
      if (this.pmFormat !== this.getPmFormat) return true
      if (this.goToLastViewOnEnter !== (localStorage.getItem('goToLastViewOnEnter') === 'true')) return true
      if (this.tagFilters !== (localStorage.getItem('tagFilters') === 'true')) return true
      if (this.folderFilters !== (localStorage.getItem('folderFilters') === 'true')) return true
      if (this.listFilters !== (localStorage.getItem('listFilters') === 'true')) return true
      if (this.ungroupTasksInHeadings !== this.userInfo.ungroupTasksInHeadings)
        return true
      if (this.changedSection) return true
      
      return false
    },
    getPmFormat() {
      return !this.userInfo.disablePmFormat
    },
    displayName() {
      if (this.user.displayName) return this.user.displayName
      return this.l['Add username']
    },
    userHidedSections() {
      if (this.userInfo.hidedSections) return this.userInfo.hidedSections.slice()
      return []
    },
    userHidedSmartViews() {
      if (this.userInfo.hidedViews) return this.userInfo.hidedViews.slice()
      return []
    },
  },
  watch: {
    userInfo() {
      this.update()
    },
  }
}

</script>

<style scoped>

.Profile.desktop {
  flex-basis: 800px;
  margin-left: 12px;
  margin-right: 12px;
  height: 400px;
}

.Profile {
  position: relative;
  display: flex;
  overflow: auto;
}

.Profile.mobile {
  flex-direction: column;
  background-color: var(--dark);
}

.mobile .cont-wrapper {
  background-color: var(--card);
}

.nav-wrapper {
  position: sticky;
  left: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background-color: var(--dark);
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

.mobile .nav-wrapper {
  border-top-right-radius: unset;
  border-bottom-right-radius: unset;
}

.mobile .nav-wrapper {
  height: unset;
  width: 100%;
}

.title {
  color: var(--primary);
}

.nav {
  padding: 14px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
}

.cont-wrapper {
  flex-basis: 100%;
}

.mobile .cont-wrapper {
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.cont {
  margin: 14px;
  margin-bottom: 40px;
}

.option {
  height: 35px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  transform: scale(1,1);
  transition-duration: .2s;
  overflow: hidden;
  position: relative;
}

.mobile .option {
  display: inline-flex;
}

.option:hover, .option.active {
  background-color: var(--light-gray);
  color: var(--primary);
}

.option:active {
  transform: scale(.95,.95);
}

.button {
  width: 100%;
  margin: 0;
}

.button:hover {
  background-color: var(--light-gray);
}

.btn-wrapper {
  margin-top: 12px;
}

.btn-trans-enter, .btn-trans-leave-to {
  opacity: 0;
  height: 0;
  margin-top: 0;
  transition-duration: .2s;
}

.btn-trans-leave, .btn-trans-enter-to {
  transition-duration: .2s;
  opacity: 1;
  margin-top: 12px;
  height: 35px;
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
