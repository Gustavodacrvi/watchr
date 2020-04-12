<template>
  <div class="popup cb shadow rb Profile scroll-thin" :class="layout">
    <div class="nav-wrapper">
      <div class="nav">
        <div>
          <div v-if="!isDesktopBreakPoint" style="height: 30px"></div>
          <span class="option rb cursor remove-highlight" :class="{active: 'General' === option}" @click="option = 'General'">General
          </span>
          <span class="option rb cursor remove-highlight" :class="{active: 'Sidebar' === option}" @click="option = 'Sidebar'">Sidebar
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
    <div class="cont-wrapper scroll-thin">
      <div class="cont">
        <transition name="fade-t" mode="out-in">
          <div v-if="option === 'General'" class="General" key="general">
            <div class="profile-wrapper">
              <ProfilePhoto/>
              <span>
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
              </span>
            </div>
            <h4 class="title">Google Gmail</h4>
            <CheckboxApp class="rb"
              name='Convert Gmail inbox messages to inbox tasks.'
              :value='getGmailInbox'
              @input="getGmailInbox = !getGmailInbox"
            />
            <CheckboxApp class="rb"
              name='Mark messages as read.'
              :value='markEmailsAsRead'
              @input="markEmailsAsRead = !markEmailsAsRead"
            />
            <CheckboxApp class="rb"
              name='Enable overdue defered tasks'
              :value='allowOverdue'
              @input="allowOverdue = !allowOverdue"
            />
            <h4 class="title">Options</h4>
            <CheckboxApp class="rb"
              name='Use 1:00pm format.'
              :value='pmFormat'
              @input="togglepmFormat"
            />
            <CheckboxApp class="rb"
              name='Manually log tasks.'
              :value='manuallyLogTasks'
              @input="manuallyLogTasks = !manuallyLogTasks"
            />
            <CheckboxApp class="rb"
              name='Group folder/list tasks in headings on Today, Tomorrow and Calendar smart views.'
              :value='!ungroupTasksInHeadings'
              @input="ungroupTasksInHeadings = !ungroupTasksInHeadings"
            />
            <h3 class="title">View</h3>
            <CheckboxApp class="rb"
              name='Always open tag filters.'
              :value='tagFilters'
              @input="toggleTagFilters"
            />
            <CheckboxApp class="rb"
              name='Always open list filters.'
              :value='listFilters'
              @input="toggleListFilters"
            />
            <CheckboxApp class="rb"
              name='Always open folder filters.'
              :value='folderFilters'
              @input="toggleFolderFilters"
            />
          </div>
          <div v-else class="Sidebar" key="sidebar">
            <h4 class="title">Options</h4>
            <CheckboxApp class="rb"
              name='Go to the last visited view on app start instead of the Today view'
              :value='goToLastViewOnEnter'
              @input="toggleGoToLastViewOnEnter"
            />
            <h4 class="title">Enabled Sections</h4>
            <CheckboxApp v-for="s in sections" :key="s.name"
              class="rb"
              :name="s.name"
              :value='!isHided(s.name)'
              :icon='s.icon'
              :color='s.iconColor'
              @input='toggleSection(s.name)'
            />
            <h4 class="title">Enabled Smart Views</h4>
            <CheckboxApp v-for="s in sidebarSmartViews" :key="s.name"
              class="rb"
              :name="s.name"
              :value='!isSmartViewHided(s.name)'
              :icon='s.icon'
              :color='s.iconColor'
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
import ProfilePhoto from '@/components/View/RenderComponents/ProfilePhoto.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    ProfilePhoto,
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
      hidedSections: [],
      hidedSmartViews: [],
      pmFormat: true,
      ungroupTasksInHeadings: false,
      goToLastViewOnEnter: false,
      changedSection: false,
      forceUpdate: false,
      manuallyLogTasks: false,
      getGmailInbox: false,
      markEmailsAsRead: false,
      allowOverdue: false,

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
        allowOverdue: this.allowOverdue || null,
        ungroupTasksInHeadings: this.ungroupTasksInHeadings || null,
        manuallyLogTasks: this.manuallyLogTasks || null,
        markEmailsAsRead: this.markEmailsAsRead || null,
        getGmailInbox: this.getGmailInbox || null,
      })
      this.changedSection = false
      this.forceUpdate = !this.forceUpdate
    },
    update() {
      this.ungroupTasksInHeadings = this.userInfo.ungroupTasksInHeadings
      this.manuallyLogTasks = this.userInfo.manuallyLogTasks
      this.markEmailsAsRead = this.userInfo.markEmailsAsRead
      this.getGmailInbox = this.userInfo.getGmailInbox
      this.allowOverdue = this.userInfo.allowOverdue
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
    ...mapGetters(['layout', 'isDesktopBreakPoint']),
    ...mapState(['user', 'userInfo']),
    sidebarSmartViews() {
      return this.$store.getters.sidebarElements
    },
    changedOptions() {
      this.forceUpdate
      if (this.pmFormat !== this.getPmFormat) return true
      if (this.goToLastViewOnEnter !== (localStorage.getItem('goToLastViewOnEnter') === 'true')) return true
      if (this.tagFilters !== (localStorage.getItem('tagFilters') === 'true')) return true
      if (this.folderFilters !== (localStorage.getItem('folderFilters') === 'true')) return true
      if (this.listFilters !== (localStorage.getItem('listFilters') === 'true')) return true
      if (this.ungroupTasksInHeadings !== this.userInfo.ungroupTasksInHeadings)
        return true
      if (this.getGmailInbox !== this.userInfo.getGmailInbox)
        return true
      if (this.allowOverdue !== this.userInfo.allowOverdue)
        return true
      if (this.markEmailsAsRead !== this.userInfo.markEmailsAsRead)
        return true
      if (this.manuallyLogTasks !== this.userInfo.manuallyLogTasks)
        return true
      if (this.changedSection) return true
      
      return false
    },
    getPmFormat() {
      return !this.userInfo.disablePmFormat
    },
    displayName() {
      if (this.user.displayName) return this.user.displayName
      return 'Add username'
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
  flex-basis: 600px;
  margin-left: 12px;
  margin-right: 12px;
  height: 500px;
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
  width: 210px;
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
  overflow: auto;
}

.mobile .cont-wrapper {
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.cont {
  margin: 14px;
  margin-bottom: 40px;
}

.profile-wrapper {
  display: flex;
}

.option {
  height: 22px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  transform: scale(1,1);
  transition-duration: .15s;
  position: relative;
}

.mobile .option {
  display: inline-flex;
  height: 30px;
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
  transition-duration: .15s;
}

.btn-trans-leave, .btn-trans-enter-to {
  transition-duration: .15s;
  opacity: 1;
  margin-top: 12px;
  height: 35px;
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
