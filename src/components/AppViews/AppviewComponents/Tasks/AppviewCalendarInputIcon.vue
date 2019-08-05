<template>
  <div class='calendar-input-tag pointer' @mouseenter='showing = true' @mouseleave='showing = false'>
    <i class='fas icon fa-calendar-alt fa-lg' :class='theme'></i>
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

  showing: boolean = false
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
