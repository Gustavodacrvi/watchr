<template>
  <div>
    <sortable
      v-model='arr'
      :animation='300'
      :disabled='disabled'
      :multi-drag='true'
      :delayOnTouchOnly='true'
      @end='update'
      @select='select'
      @deselect='deselect'
    >
      <transition-group name='fade'>
        <appnav-link v-for='el in arr'
          :key='el.id'
          :obj='el'
          :content-obj-property-name='contentObjPropertyName' :sub-elements-property-name='subElementsPropertyName' :active-content='activeContent'
          :left-pan-gesture='leftPanGesture' :right-pan-gesture='rightPanGesture'
          :options='options(el)'
          :icons='icons(el)'
          :optionsrender='options'
          :iconsrender='icons'
          @update='update'
          @panevent='panevent'
        ></appnav-link>
      </transition-group>
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
  @Prop({required: true, type: String}) contentObjPropertyName!: string
  @Prop({default: '', type: String}) activeContent!: string
  @Prop({default: '', type: String}) subElementsPropertyName!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop(Object) leftPanGesture!: PanGesture
  @Prop(Object) rightPanGesture!: PanGesture
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
      newObj[this.subElementsPropertyName] = arr
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
