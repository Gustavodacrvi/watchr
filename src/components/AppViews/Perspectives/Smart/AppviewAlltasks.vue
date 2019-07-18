<template>
  <span>
    All tasks
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'

@Component
export default class AlltasksView extends Vue {
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  created() {
    this.pushView({
      view: 'All tasks',
      viewType: 'perspective',
    })
  }
}

</script>
