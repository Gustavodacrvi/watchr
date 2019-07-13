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
import { State, Getter, Mutation } from 'vuex-class'

@Component
export default class AppviewHeadertitle extends Vue {
  @Getter isDesktop!: boolean
  @Mutation addNavBarTitle!: (title: string) => void

  @Prop(String) value!: string
  @Prop(String) icon!: string
  @Prop(String) iconColor!: string

  created() {
    this.addToTitle()
  }
  
  addToTitle() {
    this.addNavBarTitle(this.value)
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
