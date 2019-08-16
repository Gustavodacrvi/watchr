<template>
  <div v-if='isDesktop'>
    <i v-if='icon' :class='`fas fa-${icon} fa-2x`' :style='{color: iconColor}'></i>
    <span class='title'>
      {{ value }}
    </span>
    <span v-if='icon' style='width: 15px'></span>
    <i class='txt angle icon pointer fas fa-angle-down fa-sm' :class="[{'rotate': !showing}, theme]" @click="$emit('toggle')"></i>
  </div>
  <span v-else @click="$emit('toggle')" class='left'>
    <i class='txt angle icon pointer fas fa-angle-down fa-sm' :class="[{'rotate': !showing}, theme]"></i>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'
import { IndexState, IndexGetters, IndexMutations } from '../../../interfaces/store/index'

@Component
export default class AppviewHeadertitle extends Vue {
  @State theme!: IndexState.theme
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Mutation addNavBarTitle!: IndexMutations.AddNavBarTitle

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
  @Watch('value')
  onChange2() {
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
