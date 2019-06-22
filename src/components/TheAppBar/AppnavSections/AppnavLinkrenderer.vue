<template>
  <div>
    <draggable v-model='arr' :animation='300' @end='update' :disabled='disabled' :multi-drag='true' :delayOnTouchOnly='true'>
      <appnav-link v-for='el in arr' :key='el.id' :obj='el' :content='content' :sublist='sublist' :active='active' :leftpan='leftpan' :rightpan='rightpan' @update='update' @panevent='panevent' :options='options(el)' :icons='icons(el)' :optionsrender='options' :iconsrender='icons'></appnav-link>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Sortable from '@/components/Sortablejs.vue'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

import { PanGesture, ListIcon } from '@/interfaces/app'

@Component({
  components: {
    'draggable': Sortable,
    'icon': FontAwesomeIcon,
    'appnav-link': () => import('@/components/TheAppBar/AppnavSections/AppnavLink.vue'),
  },
})
export default class AppnavLinkrenderer extends Vue {
  @Prop({required: true, type: Array}) public readonly list!: any[]
  @Prop({required: true, type: String}) public readonly content!: string
  @Prop({default: '', type: String}) public readonly active!: string
  @Prop({default: '', type: String}) public readonly sublist!: string
  @Prop({default: false, type: Boolean}) public readonly disabled!: boolean

  @Prop(Object) public readonly leftpan!: PanGesture
  @Prop(Object) public readonly rightpan!: PanGesture

  @Prop({default: () => [], type: Function}) public readonly icons!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) public readonly options!: (obj: any) => ListIcon[]

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
