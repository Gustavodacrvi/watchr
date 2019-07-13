<template>
  <div v-if='isDesktop'>
    <i :class='`fas fa-${icon} fa-2x`' :style='{color: iconColor}'></i>
    <span class='title'>
      {{ value }}
    </span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

@Component
export default class AppviewHeadertitle extends Vue {
  @Getter isDesktop!: boolean

  @Prop(String) value!: string
  @Prop(String) icon!: string
  @Prop(String) iconColor!: string

  created() {
    this.addToTitle()
  }
  
  addToTitle() {
    
  }

  @Watch('isDesktop')
  onChange() {
    if (!this.isDesktop)
      this.addToTitle()
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
