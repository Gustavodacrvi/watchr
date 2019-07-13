<template>
  <div v-if='isDesktop'>
    <i :class='`fas fa-${icon} fa-2x`' :style='{color: iconColor}'></i>
    <span class='title'>
      {{ value }}
    </span>
  </div>
  <span v-else @click="$emit('toggle')" class='left'>
    <i class='txt angle icon pointer fas fa-angle-down fa-lg' :class="{'rotate': !showing}"></i>
  </span>
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
  @Prop(Boolean) showing!: boolean
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

<style scoped>

.angle {
  transition: transform .3s;
}

.rotate {
  transform: rotate(-90deg);
}

.left {
  display: inline-flex;
  height: 100%;
  align-items: center;
}

</style>

<style scoped src='@/assets/css/appView.css'>
</style>
