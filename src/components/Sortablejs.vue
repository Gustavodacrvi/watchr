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
  @Prop(String) group!: string
  @Prop(String) handle!: string
  @Prop(Array) selected!: any[]

  els: HTMLElement[] = []
  clickedOnEl: boolean = false

  mounted() {
    if (!this.disabled) {
      this.mount()
      this.select()
    }
  }
  beforeDestroy() {
    this.removeEventListeners()
  }

  mount() {
    this.removeEventListeners()
    this.addEventListeners()
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
  deselecteAll() {
    this.els = this.getChilds()
    for (const el of this.els)
      Sortable.utils.deselect(el)
  }
  select() {
    for (let i = 0; i < this.value.length; i++)
      for (const el of this.selected)
        if (this.value[i].id === el.id)
          Sortable.utils.select(this.els[i])
  }
  addEventListeners() {
    const childs = this.getChilds()
    for (const el of childs)
      el.addEventListener('click', this.elClick)
    document.addEventListener('click', this.bodyClick)
  }
  removeEventListeners() {
    const childs = this.getChilds()
    for (const el of childs)
      el.removeEventListener('click', this.elClick)
    document.removeEventListener('click', this.bodyClick)
  }
  bodyClick() {
   if (!this.clickedOnEl)
     this.$emit('empty')
  }
  elClick() {
    const NUMBER_OF_MILISECONDS_TO_WAIT_EL_CLICK = 10
    this.clickedOnEl = true
    setTimeout(() => {
      this.clickedOnEl = false
    }, NUMBER_OF_MILISECONDS_TO_WAIT_EL_CLICK)
  }

  @Watch('disabled')
  onChange() {
    if (!this.disabled) {
      this.deselecteAll()
      this.select()
    }
  }
  @Watch('selected')
  onSelectedChange() {
    if (!this.disabled) {
      this.deselecteAll()
      this.select()
    }
  }
}

</script>
