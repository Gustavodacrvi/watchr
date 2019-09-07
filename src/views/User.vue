<template>
  <transition name='fade' mode='out-in'>
    <div v-if='loggedAndVerified'
      class='app'
      key='loggedAndVerified'
    >
      <div class='view-wrapper background-color' :class='[platform, theme]'>
        <div class='view' :class='platform'>
          <transition class='transition-view' name='fade' mode='out-in'>
            <component
              :is='getComp'
              :pers='per'
              :label='label'
              :project='project'
            />
          </transition>
        </div>
      </div>
    </div>
    <div v-else-if='anonymous'
      class='app'
      key='anonymouse'
    >
    </div>
    <div v-else-if='loggedAndNotVerified'
      class='app'
      key='loggedAndNotVerified'
    >
      <div class='content'>
        <div style='margin-top: 50px' class='gray user-card-wrapper round-border' :class='theme'>
          <div class='user-card'>
            <span class='txt msg' :class='theme'>Please confirm your e-mail before continuing.</span>
            <form-button :waiting-response='waitingResponse' @click='resendConfirmationEmail'>
              Resend confirmation e-mail
            </form-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else
      class='app'
      key='not logged'
    >
      <div class='content'>
        <tab-slider
          style='margin-top: 50px'
          flex-basis='700px'
          :options="[
            {name: 'Premium', comp: 'UserPremium'},
            {name: 'Normal', comp: 'UserCreateaccount'},
            {name: 'Anonymous', comp: 'UserAnonymous'},
          ]"
        />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">

import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Mutation, Getter, State, namespace } from 'vuex-class'
import Mixin from '@/mixins/navBar'

import appUtils from '@/utils/app'

import TabSlider from '@/components/SlidersAndMenus/TabSlider.vue'
import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import { Perspective } from '../interfaces/app'

const persVuex = namespace('perspective')

const c = appUtils.AsyncComponent

@Component({
  components: {
    'tab-slider': TabSlider,
    'form-button': FormButton,
    'app-inbox': c(import('@/components/AppViews/Perspectives/Smart/AppviewInbox.vue')),
    'app-all-tasks': c(import('@/components/AppViews/Perspectives/Smart/AppviewAlltasks.vue')),
    'app-upcoming': c(import('@/components/AppViews/Perspectives/Smart/AppviewUpcoming.vue')),
    'app-overdue': c(import('@/components/AppViews/Perspectives/Smart/AppviewOverdue.vue')),
    'app-today': c(import('@/components/AppViews/Perspectives/Smart/AppviewToday.vue')),
    'app-sunday': c(import('@/components/AppViews/Perspectives/Smart/AppviewSunday.vue')),
    'app-monday': c(import('@/components/AppViews/Perspectives/Smart/AppviewMonday.vue')),
    'app-tuesday': c(import('@/components/AppViews/Perspectives/Smart/AppviewTuesday.vue')),
    'app-wednesday': c(import('@/components/AppViews/Perspectives/Smart/AppviewWednesday.vue')),
    'app-thursday': c(import('@/components/AppViews/Perspectives/Smart/AppviewThursday.vue')),
    'app-friday': c(import('@/components/AppViews/Perspectives/Smart/AppviewFriday.vue')),
    'app-saturday': c(import('@/components/AppViews/Perspectives/Smart/AppviewSaturday.vue')),
    'app-tomorrow': c(import('@/components/AppViews/Perspectives/Smart/AppviewTomorrow.vue')),
    'app-project': c(import('@/components/AppViews/Perspectives/AppviewProject.vue')),
    'app-next-week': c(import('@/components/AppViews/Perspectives/Smart/AppviewNextweek.vue')),
    'app-this-week': c(import('@/components/AppViews/Perspectives/Smart/AppviewThisweek.vue')),
    'app-next-month': c(import('@/components/AppViews/Perspectives/Smart/AppviewNextmonth.vue')),
    'app-has-project': c(import('@/components/AppViews/Perspectives/Smart/AppviewHasproject.vue')),
    'app-doesnt-have-project': c(import('@/components/AppViews/Perspectives/Smart/AppviewDoesnthaveproject.vue')),
    'app-completed': c(import('@/components/AppViews/Perspectives/Smart/AppviewCompleted.vue')),
    'app-have-tags': c(import('@/components/AppViews/Perspectives/Smart/AppviewHavetags.vue')),
    // tslint:disable-next-line:max-line-length
    'app-doesnt-have-tags': c(import('@/components/AppViews/Perspectives/Smart/AppviewDoesnthavetags.vue')),
    'app-custom-pers': c(import('@/components/AppViews/Perspectives/CustomPerspective.vue')),
    'app-custom-label': c(import('@/components/AppViews/Perspectives/LabelPerspective.vue')),
  },
})
export default class Guest extends Mixins(Mixin) {
  @State theme!: string
  @State currentAppSection!: string
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter isStandAlone!: boolean
  @Getter anonymous!: boolean
  @Getter isDesktop!: boolean
  @Getter activePers!: Perspective
  @Getter platform!: boolean
  @Mutation openAppBar!: () => void
  @Mutation closeAppBar!: () => void

  @persVuex.Getter initialPerspective!: string

  @Prop(String) pers!: string
  @Prop(String) label!: string
  @Prop(String) project!: string
  @Prop(Boolean) loaded!: string

  waitingResponse: boolean = false
  per: string = ''

  created() {
    this.per = this.pers
    if (this.ready && !this.isStandAlone && this.initialPerspective && !this.per && !this.label && !this.project) {
      console.log(3)
      this.$router.replace('user?pers=' + this.initialPerspective)
      this.$emit('loaded', true)
    } else if (this.isStandAlone)
      this.per = this.initialPerspective
    this.open()
  }
  beforeDestroy() {
    this.$emit('loaded', false)
  }

  open() {
    if (this.isDesktop && (this.loggedAndVerified || this.anonymous))
      this.openAppBar()
    else if (this.isDesktop)
      this.closeAppBar()
  }
  get getComp(): string {
    if (this.per && !this.label && !this.project) {
      switch (this.per) {
        case 'Inbox': return 'app-inbox'
        case 'Upcoming': return 'app-upcoming'
        case 'Today': return 'app-today'
        case 'Tomorrow': return 'app-tomorrow'
        case 'Overdue': return 'app-overdue'
        case 'Next week': return 'app-next-week'
        case 'This week': return 'app-this-week'
        case 'Sunday': return 'app-sunday'
        case 'Monday': return 'app-monday'
        case 'Tuesday': return 'app-tuesday'
        case 'Wednesday': return 'app-wednesday'
        case 'Thursday': return 'app-thursday'
        case 'Friday': return 'app-friday'
        case 'Saturday': return 'app-saturday'
        case 'Has project': return 'app-has-project'
        case `Doesn't have project`: return 'app-doesnt-have-project'
        case 'Completed': return 'app-completed'
        case 'Next month': return 'app-next-month'
        case 'All tasks': return 'app-all-tasks'
        case 'Have tags': return 'app-have-tags'
        case `Doesn't have tags`: return 'app-doesnt-have-tags'
      }
      return 'app-custom-pers'
    } else if (this.label && !this.project)
      return 'app-custom-label'
    else if (this.project)
      return 'app-project'
    return ''
  }
  get ready(): boolean {
    return this.undefinedPers && this.loggedAndVerified || this.anonymous
  }
  get undefinedPers() {
    return !this.pers && !this.label
  }

  @Watch('pers')
  onChange6() {
    this.per = this.pers
  }
  @Watch('initialPerspective')
  onChange5() {
    if (!this.loaded && !this.pers && !this.isDesktop) {
      this.$router.replace('user?pers=' + this.initialPerspective)
      this.$emit('loaded', true)
    }
  }
  @Watch('isDesktop')
  onResize() {
    this.open()
  }
  @Watch('loggedAndVerified')
  onUserChange() {
    this.open()
  }
  @Watch('pinedSmartPerspectives')
  onChange() {
    if (this.undefinedPers && this.loggedAndVerified || this.anonymous)
      this.$router.replace('user?pers=' + this.initialPerspective)
    this.open()
  }
}

</script>

<style scoped>

.view-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.view-wrapper.desktop {
  margin-left: 280px;
  z-index: 20;
}

.view {
  margin: 0 15px;
  position: relative;
  height: 100%;
}

.transition-view {
  height: 100%;
  position: relative;
}

.view.desktop {
  margin: 0 80px;
}

.app {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.user-card-wrapper {
  flex-basis: 700px;
}

.user-card {
  margin: 24px;
}

.msg {
  display: block;
  text-align: center;
  margin-bottom: 14px;
}

</style>
