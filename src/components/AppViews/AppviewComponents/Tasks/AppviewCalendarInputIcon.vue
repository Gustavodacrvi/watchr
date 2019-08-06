<template>
  <div class='calendar-input-tag' @mouseenter='showing = true' @mouseleave='showing = false'>
    <i class='fas icon fa-calendar-alt fa-lg pointer' :class='theme'></i>
    <transition name='fade'>
      <calendar-input v-if='showing' class='calendar'/>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import CalendarInputComp from '@/components/AppViews/AppviewComponents/Tasks/AppviewCalendarInput.vue'

@Component({
  components: {
    'calendar-input': CalendarInputComp,
  },
})
export default class CalendarInputIcon extends Vue {
  @State theme!: string

  showing: boolean = true
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
