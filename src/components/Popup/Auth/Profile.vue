<template>
  <div class="popup cb shadow rb Profile scroll-thin" :class="platform">
    <div class="nav-wrapper">
      <div class="nav">
        <div>
          <span class="option rb cursor remove-highlight" :class="{active: 'General' === option}" @click="option = 'General'">General</span>
          <span class="option rb cursor remove-highlight" :class="{active: 'Appnav' === option}" @click="option = 'Appnav'">Appnav</span>
        </div>
        <div>
          <transition name="fade-t">
            <AuthButton v-if="changedOptions" class="button"
              type='card'
              value='Save options'
              @click="save"
            />
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
          </div>
          <div v-else class="Appnav" key="appnav">
            <h4 class="title">Options</h4>
            <CheckboxApp class="rb"
              :name='l["Use 1:00pm format"]'
              :value='pmFormat'
              @input="togglepmFormat"
            />
            <h4 class="title">Enabled Sections</h4>
            <CheckboxApp v-for="s in sections" :key="s.name"
              class="rb"
              :name="l[s.name]"
              :value='!isHided(s.name)'
              :icon='s.icon'
              @input='toggleSection(s.name)'
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

import { userRef } from '@/utils/firestore'

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
        },
        {
          name: 'Tags',
          icon: 'tags',
        }
      ],
      hidedSections: [],
      pmFormat: true,
      changedSection: false,
    }
  },
  created() {
    this.update()
  },
  methods: {
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
      if (this.hidedSections.length === 2) {
        this.$store.commit('pushToast', {
          name: this.l['Please toggle at least one section.'],
          seconds: 4,
          type: 'error',
        })
      } else {
        userRef().set({
          disablePmFormat: !this.pmFormat,
        }, {merge: true})
        this.$store.dispatch('update', {
          ...this.user,
          hidedSections: this.hidedSections,
        })
        this.changedSection = false
      }
    },
    update() {
      this.pmFormat = this.getPmFormat
      this.hidedSections = this.userHidedSections
    }
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    ...mapState(['user', 'userInfo']),
    changedOptions() {
      if (this.pmFormat !== this.getPmFormat) return true
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

.nav-wrapper {
  position: sticky;
  left: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background-color: var(--dark);
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
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

.cont {
  margin: 14px;
}

.option {
  height: 35px;
  display: flex;
  align-items: center;
  padding-left: 18px;
  transform: scale(1,1);
  transition-duration: .2s;
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
}

.button:hover {
  background-color: var(--light-gray);
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
