<template>
  <div :class='`task-${group}-${id}`'>
    <transition-group name='fade'>
      <view-task v-for='task in tasks'
        :key='task.id'
        :task='task'
        :deselect-all='deselectAll'
        :allow-priority='allowPriority'
        :allow-drag='numberOfSelected > 0'

        :data-vid='task.id'

        @toggle='toggleElement'
      />
      <task-adder
        class='handle'
        key='task-adder'
        :fixed-pers='fixedPers'
        :default-labels='defaultLabels'
        :default-priority='defaultPriority'
        :allow-priority='allowPriority'
        :allow-labels='allowLabels'
        @enter='add'

        data-vid='task-adder'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import Mixin from '@/mixins/sortable'

import ViewTask from '@/components/AppViews/AppviewComponents/AppviewTask.vue'

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import TaskAdder from '@/components/AppViews/AppviewComponents/AppviewTaskAdder.vue'

Sortable.mount(new MultiDrag(), new AutoScroll())

import { Task, Label } from '../../../interfaces/app'

@Component({
  components: {
    'view-task': ViewTask,
    'task-adder': TaskAdder,
  },
})
export default class AppviewTaskrenderer extends Mixins(Mixin) {
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({required: true, type: String}) group!: string
  @Prop({required: true, type: String}) id!: string
  @Prop({default: false, type: Boolean}) allowPriority!: boolean
  @Prop({default: false, type: Boolean}) allowLabels!: boolean
  @Prop({default: undefined, type: String}) defaultPriority!: string
  @Prop({default: undefined, type: Array}) defaultLabels!: string[]
  @Prop(String) fixedPers!: string
  @Prop(Array) tasks!: Task[]

  @Getter isDesktop!: boolean

  sortable: any = null
  numberOfSelected: number = 0
  deselectAll: boolean = false
  rootSelector: string = `.task-${this.group}-${this.id}`

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

  add(obj: {name: string, priority: string}) {
    const els: string[] = this.getIdsFromElements(this.rootSelector)
    let i = 0
    let position: number = 0
    for (const id of els) {
      if (id === 'task-adder') {
        position = i
        break
      }
      i++
    }
    const order = els.filter(el => el !== 'task-adder')
    this.$emit('add', {position, order, ...obj})
  }
  calcSelectedElements(evt?: any) {
    if (evt) {
      const children = this.rootComponent.childNodes
      let deSelectAll = true
      for (const child of children)
        if (evt.path.includes(child)) {
          deSelectAll = false
          break
        }
      if (deSelectAll)
        for (const el of evt.path)
        if (el.classList && el.classList.contains('cancel-sortable-unselect')) {
          deSelectAll = false
          break
        }
      if (deSelectAll) {
        for (const child of children)
          Sortable.utils.deselect(child)
        this.deselectAll = !this.deselectAll
      }
    }

    this.numberOfSelected = document.querySelectorAll('.sortable-selected').length
    setTimeout(() => {
      this.$emit('selected', this.getIdsFromSelectedElements(this.rootSelector).filter(el => el !== 'task-adder'))
    }, 1)
  }
  toggleElement({el, select}: {el: HTMLElement, select: boolean}) {
    if (select)
      Sortable.utils.select(el)
    else Sortable.utils.deselect(el)
    this.calcSelectedElements()
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>

<style scoped>

</style>
