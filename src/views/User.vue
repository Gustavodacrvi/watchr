<template>
  <transition name='fade' mode='out-in'>
    <div v-if='loggedAndVerified'
      class='app'
      key='loggedAndVerified'
    >
      <div class='view-wrapper background-color' :class='[platform, theme]'>
        <div class='view' :class='platform'>
          <transition name='fade' mode='out-in'>
            <component
              v-model='showing'
              :is='getComp'
              :pers='per'
              :label='label'
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

@Component({
  components: {
    'tab-slider': TabSlider,
    'form-button': FormButton,
    'app-inbox': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/Smart/AppviewInbox.vue')),
    'app-all-tasks': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/Smart/AppviewAlltasks.vue')),
    'app-upcoming': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/Smart/AppviewUpcoming.vue')),
    'app-today': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/Smart/AppviewToday.vue')),
    'app-have-tags': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/Smart/AppviewHavetags.vue')),
    // tslint:disable-next-line:max-line-length
    'app-doesnt-have-tags': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/Smart/AppviewDoesnthavetags.vue')),
    'app-custom-pers': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/CustomPerspective.vue')),
    'app-custom-label': appUtils.AsyncComponent(import('@/components/AppViews/Perspectives/LabelPerspective.vue')),
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

  waitingResponse: boolean = false
  showing: boolean = false
  per: string = ''
  loaded: boolean = false

  created() {
    this.per = this.pers
    if (this.ready && !this.isStandAlone && this.initialPerspective && !this.per) {
      this.$router.replace('user?pers=' + this.initialPerspective)
      this.loaded = true
    } else if (this.isStandAlone)
      this.per = this.initialPerspective
    this.open()
    if (this.currentAppSection !== 'overview' && this.isDesktop)
      this.showing = true
  }

  open() {
    if (this.isDesktop && (this.loggedAndVerified || this.anonymous))
      this.openAppBar()
    else if (this.isDesktop)
      this.closeAppBar()
  }
  get getComp(): string {
    if (this.per) {
      switch (this.per) {
        case 'Inbox': return 'app-inbox'
        case 'Upcoming': return 'app-upcoming'
        case 'Today': return 'app-today'
        case 'All tasks': return 'app-all-tasks'
        case 'Have tags': return 'app-have-tags'
        case `Doesn't have tags`: return 'app-doesnt-have-tags'
      }
      return 'app-custom-pers'
    } else if (this.label)
      return 'app-custom-label'
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
    if (!this.loaded && !this.pers) {
      this.$router.replace('user?pers=' + this.initialPerspective)
      this.loaded = true
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
  @Watch('currentAppSection')
  onChange2() {
    if (this.currentAppSection !== 'overview' && this.isDesktop)
      this.showing = true
    else this.showing = false
  }
}

</script>

<style scoped>

.view-wrapper {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.view-wrapper.desktop {
  margin-left: 280px;
  z-index: 20;
}

.view {
  margin: 0 15px;
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
