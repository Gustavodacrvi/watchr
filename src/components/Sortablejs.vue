<template>
  <div ref='sortable' class='sort'>
    <span class='txt el'>item 1</span>
    <span class='txt el'>item 2</span>
    <span class='txt el'>item 3</span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import Sortable, { MultiDrag, Swap } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

Sortable.mount(new MultiDrag(), new AutoScroll())

@Component
export default class SortableComponent extends Vue {

  public sortable: any = null

  public mounted() {
    const div: any = this.$refs['sortable']
    this.sortable = Sortable.create(div)
  }
}

</script>


<style scoped>

.sort {
  margin: 0 50px;
}

.el {
  display: block;
  background-color: #242424;
  cursor: pointer;
  margin: 6px;
}

</style>
