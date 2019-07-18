<template>
  <span>
    Today
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'

@Component
export default class TodayView extends Vue {
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  created() {
    this.pushView({
      view: 'Today',
      viewType: 'perspective',
    })
  }
}

</script>
