<template>
  <span class='txt'>
    {{smartPerspectives}}
    <div style='height: 100px'></div>
    {{smartOrder}}
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, namespace } from 'vuex-class'

import { Label, SmartPerspective } from '@/interfaces/app'

const persVuex = namespace('perspective')

@Component
export default class OverviewAppnav extends Vue {
  @persVuex.State smartPerspectives!: SmartPerspective[]
  @persVuex.State smartOrder!: string[]
}

</script>

<style scoped>

</style>
