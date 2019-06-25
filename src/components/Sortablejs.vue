<template>
  <div class='sort'>
    <slot></slot>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Sortable, { MultiDrag, Swap } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

Sortable.mount(new MultiDrag(), new AutoScroll())

@Component
export default class SortableComponent extends Vue {
  @Prop(Array) value!: any[]
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: 150, type: Number}) animation!: number
  @Prop({default: false, type: Boolean}) multiDrag!: boolean
  @Prop({default: 'sortable-selected'}) selectedClass!: string
  @Prop(String) public readonly group!: string
  @Prop(String) public readonly handle!: string

  els: HTMLElement[] = []

  mounted() {
    this.mount()
  }

  mount() {
    this.els = this.getChilds()

    const obj: any = {
      disabled: this.disabled,
      animation: this.animation,
      multiDrag: this.multiDrag,
      selectedClass: 'sortable-selected',
      group: this.group,

      onUpdate: (e: any) => {
        this.$emit('input', this.moveElements())
      },
      onEnd: (e: any) => {
        this.$emit('end', e)
      },
      onSelect: (e: any) => {
        this.$emit('select', e)
      },

      onDeselect: (e: any) => {
        this.$emit('deselect', e)
      },
    }
    if (this.handle)
      obj['handle'] = this.handle

    const sortable: any = new Sortable.create(this.sortableRoot(), obj)
  }
  moveElements(): any[] {
    const arr: any[] = []
    const childs: HTMLElement[] = this.getChilds()
    for (let i = 0; i < this.value.length; i++)
      for (let j = 0; j < this.value.length; j++)
        if (childs[i].isEqualNode(this.els[j]))
          arr.push(this.value[j])
    this.els = childs.slice()
    return arr
  }
  getChilds(): HTMLElement[] {
    return Array.prototype.slice.call(this.sortableRoot().childNodes).slice()
  }

  sortableRoot(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    if (!this.hasTransitionGroup)
      return root
    return root.childNodes[0] as HTMLElement
  }
  hasTransitionGroup(): boolean {
    if (this.$slots.default && this.$slots.default[0].tag === 'vue-component-19-transition-group')
      return true
    return false
  }

  @Watch('disabled')
  onChange() {
    this.mount()
  }
}

</script>
