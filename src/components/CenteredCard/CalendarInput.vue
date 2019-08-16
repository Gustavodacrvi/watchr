<template>
  <calendar-input @select='select'/>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import CalendarInputComp from '@/components/AppViews/AppviewComponents/Tasks/AppviewCalendarInput.vue'
import { IndexState, IndexMutations } from '../../interfaces/store/index'

@Component({
  components: {
    'calendar-input': CalendarInputComp,
  },
})
export default class CenteredCardCalendarInput extends Vue {
  @State('centeredCard') card!: IndexState.centeredCard
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  select(obj: any) {
    if (this.card) {
      this.card.listIconHandler(obj)
      this.pushCenteredCard(null)
    }
  }
}

</script>

