<template>
  <transition name='fade' mode='out-in'>
    <div v-if='loggedAndVerified'
      class='app'
      key='loggedAndVerified'
    >
      <span class='txt'>logged and verified</span>    
    </div>
    <div v-else-if='loggedAndNotVerified'
      class='app'
      key='loggedAndNotVerified'
    >
      <span class='txt'>logged and not verified</span>
    </div>
    <div v-else-if='anonymous'
      class='app'
      key='anonymouse'
    >
      <span class='txt'>logged as anonymous</span>
    </div>
    <div v-else
      class='app'
      key='not logged'
    >
      <div class='slider'>
        <tab-slider
        />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Mutation, Getter, State } from 'vuex-class'

import appUtils from '@/utils/app'

@Component({
  components: {
    'tab-slider': appUtils.AsyncComponent(import('@/components/SlidersAndMenus/TabSlider.vue')),
  },
})
export default class Guest extends Vue {
  @State theme!: string
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean
  @Getter isDesktop!: boolean
  @Mutation openAppBar!: () => void
  @Mutation closeAppBar!: () => void

  created() {
    this.open()
  }

  open() {
    if (this.isDesktop && (this.loggedAndVerified || this.anonymous))
      this.openAppBar()
    else if (this.isDesktop)
      this.closeAppBar()
  }

  @Watch('isDesktop')
  onResize() {
    this.open()
  }
  @Watch('loggedAndVerified')
  onUserChange() {
    this.open()
  }
}

</script>

<style scoped>

.app {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.slider {
  margin-top: 60px;
}

</style>
