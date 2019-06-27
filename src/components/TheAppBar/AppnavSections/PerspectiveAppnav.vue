<template>
  <div>
    <transition
      name='fade'
      mode='out-in'
    >
      <div v-if='selected.length === 0'
        class='header title'
        key='header-title'
      >
        <span class='title'>PERSPECTIVES</span>
      </div>
      <div v-else
        class='header options'
        key='header-options'
      >
        <ft-icon
          class='header-icon icon txt pointer'
          icon='thumbtack'
          @click='bindSelectedIcons' />
        <ft-icon-layers class='header-icon icon pointer' @click='unbindSelectedIcons'>
          <ft-icon
            class='txt icon pointer pointer'
            icon='thumbtack' />
          <ft-icon
            icon='slash'
            transform='shrink-5'
            :style="{ color: '#525252' }" />
        </ft-icon-layers>
      </div>
    </transition>
    <renderer
      content-obj-property-name='name'
      :active-content='perspective'
      v-model='smart'
      :icons='icons'
      :options='options'
      @input='saveSmart'
      @selected="select"
    ></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavSections/AppnavComponents/AppnavListrenderer.vue'

import appUtil from '@/utils/app'

import { Perspective, ListIcon, Alert } from '@/interfaces/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faThumbtack, faSlash } from '@fortawesome/free-solid-svg-icons'

library.add(faThumbtack, faSlash)

const perspective = namespace('perspective')

@Component({
  components: {
    renderer: ListRenderer,
  },
})
export default class PerspectiveAppnav extends Vue {
  @State theme!: string
  @Mutation pushAlert!: (alert: Alert) => void

  @perspective.State perspectives!: Perspective[]
  @perspective.Getter smartPerspectives!: Perspective[]
  @perspective.Action toggleBindPerspectivesById!: (obj: {ids: string[], binded?: boolean | undefined}) => void
  @perspective.Action updatePerspectives!: (perspectives: Perspective[]) => void
  @perspective.Action bindPerspectives!: (ids: string[]) => void

  perspective: string = 'Today'
  smart: Perspective[] = []
  selected: Perspective[] = []

  created() {
    this.smart = this.smartPerspectives
  }

  unbindSelectedIcons() {
    this.toggleBindPerspectivesById({
      ids: this.selected.map(el => el.id),
      binded: false,
    })
  }
  bindSelectedIcons() {
    this.toggleBindPerspectivesById({
      ids: this.selected.map(el => el.id),
      binded: true,
    })
  }
  icons(pers: Perspective): ListIcon[] {
    if (pers.binded)
      return [
        {
          icon: 'thumbtack',
          iconColor: '',
          size: 'xs',
        },
      ]
    return []
  }
  options(pers: Perspective): ListIcon[] {
    let name = 'unbind from overview'
    if (!pers.binded)
      name = 'bind on overview'
    return [
      {
        name,
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: (per: Perspective) => {
          this.toggleBindPerspectivesById({ids: [per.id]})
          this.pushAlert({
            name: `Label <strong>${name}</strong> was successfully added.`,
            duration: 2.5,
            type: 'error',
          })
        },
      },
    ] as ListIcon[]
  }
  select(pers: Perspective[]) {
    this.selected = pers
  }
  saveSmart() {
    this.updatePerspectives(appUtil.updateArrayOrderFromFilteredArray(this.perspectives, this.smart))
  }

  @Watch('perspectives')
  onPerspectivesChange() {
    this.smart = this.smartPerspectives
  }
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
