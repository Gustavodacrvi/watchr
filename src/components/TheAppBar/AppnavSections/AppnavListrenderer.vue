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
    'appnav-link': () => import('@/components/TheAppBar/AppnavSections/AppnavElement.vue'),
  },
})
export default class AppnavLinkrenderer extends Vue {
  @Prop({required: true, type: Array}) list!: any[]
  @Prop({required: true, type: String}) content!: string
  @Prop({default: '', type: String}) active!: string
  @Prop({default: '', type: String}) sublist!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop(Object) leftpan!: PanGesture
  @Prop(Object) rightpan!: PanGesture
  @Prop({default: () => [], type: Function}) icons!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) options!: (obj: any) => ListIcon[]

  arr: any[] = this.list

  getSelectedElements(event: any): any[] {
    const indexes: number[] = event.newIndicies.map((el: any) => el.index)
    const els: any[] = []
    for (const i of indexes)
      els.push(this.list[i])
    return els
  }
  select(e: any) {
    this.$emit('selected', this.getSelectedElements(e))
  }
  deselect(e: any) {
    this.$emit('selected', this.getSelectedElements(e))
  }
  update({arr, id}: {arr: any[], id: string}) {
    if (id) {
      const newObj = this.arr.find((el: any) => {
        return el.id === id
      })
      newObj[this.sublist] = arr
    }
    this.$emit('update', {arr: this.arr, id})
  }
  panevent(obj: any) {
    this.$emit('panevent', obj)
  }

  @Watch('list')
  onChange() {
    this.arr = this.list
  }
}

</script>
