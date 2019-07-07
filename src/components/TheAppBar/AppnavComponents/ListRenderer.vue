<template>
  <div :class='`sort-${group}`'>
    <transition-group name='fade'>
      <list-element v-for='obj in list'
        :key='obj.id'
        :id='obj.id'
        :name='obj.name'
        :icon='obj.icon'
        :iconColor='obj.iconColor'
        :options='options(obj)'
        :help-icons='helpIcons(obj)'
        :show-handle='numberOfSelected > 0'
        :deselect-all='deselectAll'
        @toggle='toggleElement'
        @clearselected='clearSlected'

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

import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'list-element': ListElement,
  },
})
export default class ListRenderer extends Vue {
  @Prop({required: true, type: Array}) list!: any[]
  @Prop({required: true, type: String}) group!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: () => [], type: Function}) options!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) helpIcons!: (obj: any) => ListIcon[]

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
      disabled: this.disabled,
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: true,
      dataIdAttr: 'data-sortableid',

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements()
        this.$emit('update', ids)
      },
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
  getIdsFromSelectedElements(): string[] {
    const root = document.querySelector(`.sort-${this.group}`)
    if (root) {
      const arr: HTMLElement[] = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const ids: string[] = []
      for (const el of arr)
        if (el.dataset.vid && el.classList.contains('sortable-selected'))
          ids.push(el.dataset.vid)
      return ids
    }
    return []
  }
  toggleElement({el, select}: {el: HTMLElement, select: boolean}) {
    if (!this.isDesktop && !this.disabled) {
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
    setTimeout(() => {
      this.$emit('selected', this.getIdsFromSelectedElements())
    }, 1)
  }
  clearSlected() {
    this.$emit('selected', [])
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>
