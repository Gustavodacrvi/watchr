<template>
  <div :class='`sort-${group}`'>
    <transition-group name='fade'>
      <list-element v-for='obj in list'
        :key='obj.id'
        :name='obj.name'
        :options='options(obj)'
        :show-handle='numberOfSelected > 0'
        :deselect-all='deselectAll'
        @toggle='toggleElement'

        :data-vid='obj.id'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

Sortable.mount(new MultiDrag(), new AutoScroll())

import ListElement from '@/components/TheAppBar/AppnavComponents/ListElement.vue'

import { List, ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'list-element': ListElement,
  },
})
export default class ListRenderer extends Vue {
  @Prop({required: true, type: Array}) list!: any[]
  @Prop({required: true, type: String}) group!: string
  @Prop({default: () => () => {
    return []
  },type: Function}) options!: (obj: any) => ListIcon[]

  @Getter isDesktop!: boolean

  numberOfSelected: number = 0
  sortable: any = null
  test: any = null
  deselectAll: boolean = false

  mounted() {
    this.mount()
    document.addEventListener('click', this.calcSelectedElements)
  }
  beforeDestroy() {
    document.removeEventListener('click', this.calcSelectedElements)
  }

  mount() {
    const options: any = {
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: true,
      dataIdAttr: 'data-sortableid',

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements()
        this.$emit('update', ids)
      }
    }

    if (!this.isDesktop)
      options['handle'] = '.handle'

    this.sortable = new Sortable(this.rootComponent, options)
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
  toggleElement({el, select}: {el: HTMLElement, select: boolean}) {
    if (!this.isDesktop) {
      if (select)
        Sortable.utils.select(el)
      else Sortable.utils.deselect(el)
      this.calcSelectedElements()
    }
  }
  calcSelectedElements(evt?: any) {
    if (evt && !this.isDesktop) {
      const children = this.rootComponent.childNodes
      let deSelectAll = true
      for (const child of children)
        if (evt.path.includes(child))
          deSelectAll = false
      this.test = deSelectAll
      if (deSelectAll) {
        for (const child of children)
          Sortable.utils.deselect(child)
        this.deselectAll = !this.deselectAll
      }
    }
    
    this.numberOfSelected = document.querySelectorAll('.sortable-selected').length
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>
