<template>
  <div :class='`sort-${group}`'>
    <transition-group name='fade-fast'>
      <list-element v-for='obj in list'
        :key='obj.id'
        :name='obj.name'

        :data-vid='obj.id'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

Sortable.mount(new MultiDrag(), new AutoScroll())

import { List } from '../../../interfaces/app'

@Component({
  components: {
    'list-element': () => import('@/components/TheAppBar/AppnavComponents/ListElement.vue'),
  },
})
export default class ListRenderer extends Vue {
  @Prop({required: true, type: Array}) list!: any[]
  @Prop({required: true, type: String}) group!: string

  mounted() {
    this.mount()
  }

  mount() {
    const sort = new Sortable(this.rootComponent, {
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: true,
      dataIdAttr: 'data-sortableid',

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements()
        this.$emit('update', ids)
      },
    })
  }

  getIdsFromElements(): string[] {
    const root = document.querySelector(`.sort-${this.group}`)
    if (root) {
      const arr = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const ids: string[] = []
      for (const el of arr)
        ids.push(el.dataset.vid)
      return ids
    }
    return []
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>

<style scoped>

.sortable-selected {
  background-color: red;
}

</style>
