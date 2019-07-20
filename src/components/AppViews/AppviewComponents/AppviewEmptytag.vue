<template>
  <div class='tag-wrapper border' :class='theme'>
    <span class='txt name fade'>{{ name }}</span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class AppviewEmptytag extends Vue {
  @State theme!: string
  
  @Prop(String) name!: string
}

</script>

<style scoped>

</style>
