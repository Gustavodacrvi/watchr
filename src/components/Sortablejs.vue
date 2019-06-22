<template>
  <div ref='sortable' class='sort'>
    <slot></slot>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import Sortable, { MultiDrag, Swap } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

Sortable.mount(new MultiDrag(), new AutoScroll())

@Component
export default class SortableComponent extends Vue {
  @Prop(Array) public value!: any[]
  @Prop({default: false, type: Boolean}) public readonly delayOnTouchOnly!: boolean
  @Prop({default: false, type: Boolean}) public readonly disabled!: boolean
  @Prop({default: 150, type: Number}) public readonly animation!: number
  @Prop({default: false, type: Boolean}) public readonly multiDrag!: boolean
  @Prop(String) public readonly group!: string

  public els: any = null

  public mounted() {
    const ref: string = 'sortable'
    const div: any = this.$refs[ref]
    this.els = this.getChilds()

    const sortable: any = new Sortable.create(div, {
      delayOnTouchOnly: this.delayOnTouchOnly,
      disabled: this.disabled,
      animation: this.animation,
      multiDrag: this.multiDrag,
      group: this.group,

      onUpdate: (v: any) => {
        this.$emit('input', this.moveElements())
      },
      onEnd: (v: any) => {
        this.$emit('end', v)
      },
    })
  }

  public getChilds(): any[] {
    const ref: string = 'sortable'
    const div: any = this.$refs[ref]
    return Array.prototype.slice.call(div.childNodes).slice()
  }
  public moveElements(): any[] {
    const childs = this.getChilds()
    const arr: any[] = []
    for (let i = 0; i < this.value.length; i++) {
      for (let j = 0; j < this.value.length; j++) {
        if (childs[i].isEqualNode(this.els[j])) {
          arr.push(this.value[j])
        }
      }
    }
    this.els = childs.slice()
    return arr
  }
}

</script>


<style scoped>

.sort {
  margin: 0 50px;
}

</style>
