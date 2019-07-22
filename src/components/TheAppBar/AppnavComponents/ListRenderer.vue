<template>
  <div :class='`sort-${group}`'>
    <transition-group name='fade'>
      <list-element v-for='obj in list'
        :key='obj.id'
        :id='obj.id'
        :show='obj.show'
        :number='obj.number'
        :name='obj.name'
        :icon='obj.icon'
        :active='active'
        :iconColor='obj.iconColor'
        :options='options(obj)'
        :route='route'
        :help-icons='helpIcons(obj)'
        :show-handle='numberOfSelected > 0'
        :deselect-all='deselectAll'
        @toggle='toggleElement'
        @clearselected='clearSelected'

        :data-vid='obj.id'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import Mixin from '@/mixins/sortable'

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
export default class ListRenderer extends Mixins(Mixin) {
  @Prop({required: true, type: Array}) list!: any[]
  @Prop({required: true, type: String}) group!: string
  @Prop({required: true, type: String}) active!: string
  @Prop({required: true, type: String}) route!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: () => [], type: Function}) options!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) helpIcons!: (obj: any) => ListIcon[]

  @Getter isDesktop!: boolean

  numberOfSelected: number = 0
  sortable: any = null
  deselectAll: boolean = false
  rootSelector: string = `.sort-${this.group}`

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
      group: this.group,

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements(this.rootSelector)
        this.$emit('update', ids)
      },
    }

    if (!this.isDesktop)
      options['handle'] = '.handle'

    this.sortable = new Sortable(this.rootComponent, options)
  }

  toggleElement({el, select}: {el: HTMLElement, select: boolean}) {
    if (select && !this.disabled)
      Sortable.utils.select(el)
    else Sortable.utils.deselect(el)
    this.calcSelectedElements()
  }
  calcSelectedElements(evt?: any) {
    if (evt) {
      const children = this.rootComponent.childNodes
      let deSelectAll = true
      for (const child of children)
        if (evt.path.includes(child))
          deSelectAll = false
      if (deSelectAll) {
        for (const child of children)
          Sortable.utils.deselect(child)
        this.deselectAll = !this.deselectAll
      }
    }

    this.numberOfSelected = document.querySelectorAll('.sortable-selected').length
    setTimeout(() => {
      this.$emit('selected', this.getIdsFromSelectedElements(this.rootSelector))
    }, 1)
  }
  clearSelected() {
    this.$emit('selected', [])
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>
