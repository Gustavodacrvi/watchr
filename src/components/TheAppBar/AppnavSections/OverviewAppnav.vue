<template>
  <span class='txt'>
    asdf
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, namespace } from 'vuex-class'

import { Label } from '@/interfaces/app'

const label = namespace('label')

@Component
export default class OverviewAppnav extends Vue {}

</script>

<style scoped>

</style>
