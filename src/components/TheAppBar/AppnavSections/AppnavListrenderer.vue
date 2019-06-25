<template>
  <div>
    <sortable
      v-model='arr'
      v-bind='handle'
      :animation='300'
      :disabled='disabled'
      :multi-drag='true'
      :selected='selectedElements'
      @input='save'
      @end='update'
      @empty='empty'
    >
      <transition-group name='fade'>
        <appnav-link v-for='el in arr'
          :key='el.id'
          :obj='el'
          :content-obj-property-name='contentObjPropertyName' :sub-elements-property-name='subElementsPropertyName' :active-content='activeContent'
          :icons='icons(el)'
          :options='options(el)'
          :optionsrender='options'
          :iconsrender='icons'
          :is-selection-empty='isSelectionEmpty'
          @update='update'
          @click='select'
        ></appnav-link>
      </transition-group>
    </sortable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import Sortable from '@/components/Sortablejs.vue'

import { ListIcon } from '@/interfaces/app'

@Component({
  components: {
    'sortable': Sortable,
    'appnav-link': () => import('@/components/TheAppBar/AppnavSections/AppnavElement.vue'),
  },
})
export default class AppnavLinkrenderer extends Vue {
  @Prop({required: true, type: Array}) value!: any[]
  @Prop({required: true, type: String}) contentObjPropertyName!: string
  @Prop({default: '', type: String}) activeContent!: string
  @Prop({default: '', type: String}) subElementsPropertyName!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: () => [], type: Function}) icons!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) options!: (obj: any) => ListIcon[]

  @Getter isDesktop!: boolean

  arr: any[] = this.value
  selected: Set<string> = new Set()
  selectedElements: any[] = []
  sorting: boolean = true

  select(obj: any) {
    if (!this.disabled) {
      if (this.selected.has(obj))
        this.selected.delete(obj)
      else
        this.selected.add(obj)
      this.selectedElements = Array.from(this.selected)
      this.$emit('selected', this.selectedElements)
    }
  }
  empty() {
    if (!this.disabled && this.selected.size > 0) {
      this.selected.clear()
      this.selectedElements = Array.from(this.selected)
      this.$emit('selected', this.selectedElements)
    }
  }

  get isSelectionEmpty(): boolean {
    if (this.isDesktop)
      return true
    return this.selectedElements.length === 0
  }
  get handle(): object | undefined {
    if (!this.isDesktop)
      return {
        ['handle']: '.handle',
      }
    return {
      ['handle']: '.content-handle',
    }
  }

  update({arr, id}: {arr: any[], id: string}) {
    if (id) {
      const newObj = this.arr.find((el: any) => {
        return el.id === id
      })
      newObj[this.subElementsPropertyName] = arr
    }
    this.$emit('input', this.arr)
  }
  save() {
    this.$emit('input', this.arr)
    this.$emit('update', {arr: this.arr})
  }
  @Watch('value')
  onValueChange() {
    this.arr = this.value
  }
}

</script>
