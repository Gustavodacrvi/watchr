<template>
  <div>
    {{ perspectiveData }}
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Mutation, Getter } from 'vuex-class'

import { Perspective } from '../../../interfaces/app'

@Component
export default class PerspectiveAppview extends Vue {
  @Getter perspectiveData!: Perspective | undefined
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  created() {
    this.pushView({
      view: this.$route.params.persname,
      viewType: 'perspective',
    })
  }

  @Watch('$route')
  onChange() {
    this.pushView({
      view: this.$route.params.persname,
      viewType: 'perspective',
    })
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
