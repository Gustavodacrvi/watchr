<template>
  <div>
    <draggable v-model='arr' :animation='300' @end='update' :disabled='disabled'>
      <appnav-link v-for='el in arr' :key='el.id' :obj='el' :content='content' :sublist='sublist' :active='active' :leftpan='leftpan' :rightpan='rightpan' @update='update' @panevent='panevent' :icons='mapicon(icons, el)'></appnav-link>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Draggable from 'vuedraggable'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

import { PanGesture, ListIcon } from '@/interfaces/app'

@Component({
  components: {
    'draggable': Draggable,
    'icon': FontAwesomeIcon,
    'appnav-link': () => import('@/components/TheAppBar/AppnavSections/AppnavLink.vue'),
  },
})
export default class AppnavLinkrenderer extends Vue {
  @Prop({required: true}) public readonly list!: any[]
  @Prop({required: true}) public readonly content!: string
  @Prop({default: ''}) public readonly active!: string
  @Prop({default: ''}) public readonly sublist!: string
  @Prop({default: false}) public readonly disabled!: boolean
  @Prop({default: false}) public readonly icons!: ListIcon
  @Prop({default: () => (icons: ListIcon[]) => {
    return icons
  }}) public readonly mapicon!: (icons: ListIcon, obj: any) => ListIcon[]

  @Prop() public readonly leftpan!: PanGesture
  @Prop() public readonly rightpan!: PanGesture

  public arr: any[] = this.list

  @Watch('list')
  public onChange(): void {
    this.arr = this.list
  }

  public update({arr, id}: {arr: any[], id: string}): void {
    if (id) {
      const newObj = this.arr.find((el: any) => {
        return el.id === id
      })
      newObj[this.sublist] = arr
    }

    this.$emit('update', {arr: this.arr, id})
  }
  public panevent(obj: any): void {
    this.$emit('panevent', obj)
  }
}

</script>
