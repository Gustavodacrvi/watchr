<template>
  <div>
    <sortable v-model='arr' :animation='300' @end='update' :disabled='disabled' :multi-drag='true' :delayOnTouchOnly='true' @select='select' @deselect='deselect'>
      <appnav-link v-for='el in arr' :key='el.id' :obj='el' :content='content' :sublist='sublist' :active='active' :leftpan='leftpan' :rightpan='rightpan' @update='update' @panevent='panevent' :options='options(el)' :icons='icons(el)' :optionsrender='options' :iconsrender='icons'></appnav-link>
    </sortable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Sortable from '@/components/Sortablejs.vue'

import { PanGesture, ListIcon } from '@/interfaces/app'

@Component({
  components: {
    'sortable': Sortable,
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

  public getSelectedElements(event: any): any[] {
    const indexes: number[] = event.newIndicies.map((el: any) => el.index)
    const els: any[] = []
    for (const i of indexes) {
      els.push(this.list[i])
    }
    return els
  }

  public select(e: any): void {
    this.$emit('selected', this.getSelectedElements(e))
  }
  public deselect(e: any): void {
    this.$emit('selected', this.getSelectedElements(e))
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

  @Watch('list')
  public onChange(): void {
    this.arr = this.list
  }
}

</script>
