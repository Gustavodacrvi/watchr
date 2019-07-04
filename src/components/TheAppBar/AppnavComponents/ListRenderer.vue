<template>
  <div>
    <transition-group name='fade'>
      <div key='2'>item 4</div>
      <div key='1'>item 5</div>
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import { MultiDrag } from 'sortablejs';

Sortable.mount(new AutoScroll(), new MultiDrag())

@Component
export default class ListRenderer extends Vue {
  @Prop() list!: any[]
  @Prop({default: 0, type: Number}) level!: number
  @Prop({default: null}) parentId!: string | null

  mounted() {
    console.log(this.getRootComponent(), this.getRootComponent().children)
    const sortable = new Sortable(this.getRootComponent(), {
      animation: 150,
    })
  }

  getRootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    console.log(root)
    return root.childNodes[0] as HTMLElement
  }
}

</script>

<style scoped>

</style>
