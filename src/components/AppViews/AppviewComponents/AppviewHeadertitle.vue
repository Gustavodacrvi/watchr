<template>
  <div v-if='isDesktop'>
    <i v-if='icon' :class='`fas fa-${icon} fa-2x`' :style='{color: iconColor}'></i>
    <app-pie v-if="progress || progress === 0" :svg-width='45' :progress='progress'/>
    <span class='title'>
      {{ value }}
    </span>
    <span v-if='icon' style='width: 15px'></span>
  </div>
  <span v-else @click="$emit('toggle')" class='left'>
    <i class='txt angle icon pointer fas fa-angle-down fa-sm' :class="[{'rotate': !showing}, theme]"></i>
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'
import { IndexState, IndexGetters, IndexMutations } from '../../../interfaces/store/index'

import pie from '@/components/AppViews/AppviewComponents/AppviewPieprogress.vue'

@Component({
  components: {
    'app-pie': pie,
  },
})
export default class AppviewHeadertitle extends Vue {
  @State theme!: IndexState.theme
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Mutation addNavBarTitle!: IndexMutations.AddNavBarTitle

  @Prop(String) value!: string
  @Prop(String) icon!: string
  @Prop(Boolean) showing!: boolean
  @Prop(String) iconColor!: string
  @Prop(Number) progress!: number

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

.title {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 15px !important;
}

.pie-wrapper {
  top: 7px;
  left: 5px;
}

.left {
  display: inline-flex;
  height: 100%;
  align-items: center;
}

</style>

<style scoped src='@/assets/css/appView.css'>
</style>
