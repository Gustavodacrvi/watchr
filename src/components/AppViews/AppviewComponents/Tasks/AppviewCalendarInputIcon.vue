<template>
  <div class='calendar-input-tag' @mouseenter='showing = true' @mouseleave='showing = false'>
    <i class='fas icon fa-calendar-alt fa-lg pointer' @click='openCenteredCard' :class='theme'></i>
    <transition name='fade'>
      <calendar-input v-if='showing && isDesktop' class='calendar' @select='select'/>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import CalendarInputComp from '@/components/AppViews/AppviewComponents/Tasks/AppviewCalendarInput.vue'

import { CenteredCard } from '../../../../store'

@Component({
  components: {
    'calendar-input': CalendarInputComp,
  },
})
export default class CalendarInputIcon extends Vue {
  @State theme!: string
  @Mutation pushCenteredCard!: (card: CenteredCard) => void
  @Getter isDesktop!: boolean

  showing: boolean = false

  select(obj: any) {
    this.$emit('select', obj)
  }
  openCenteredCard() {
    if (!this.isDesktop)
      this.pushCenteredCard({
        type: 'Component',
        flexBasis: '275px',
        listIcons: [],
        compName: 'CalendarInput',
        listIconHandler: (e: any) => {console.log(e)},
      })
  }
}

</script>

<style scoped>

.calendar-input-tag {
  position: relative;
}

.calendar {
  position: absolute;
  top: 100%;
  right: 100%;
}

</style>
