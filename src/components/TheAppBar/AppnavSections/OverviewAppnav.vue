<template>
  <span class='txt'>
    <span v-for='lab in labels' :key='lab.id' class='span'>
      {{ lab.name }}
      {{ lab.id }}
    </span>
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, namespace } from 'vuex-class'

import { Label } from '@/interfaces/app'

const label = namespace('label')

@Component
export default class OverviewAppnav extends Vue {
  @label.State labels!: Label[]
}

</script>

<style scoped>

</style>
