<template>
  <div :class='`task-${group}-${id}`'>
    <transition-group name='list' :class='theme'>
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
        :fixed-label='fixedLabel'
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

import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'
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
  @State theme!: string
  
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({required: true, type: String}) group!: string
  @Prop({required: true, type: String}) id!: string
  @Prop({default: false, type: Boolean}) allowPriority!: boolean
  @Prop({default: false, type: Boolean}) allowLabels!: boolean
  @Prop({default: undefined, type: String}) defaultPriority!: string
  @Prop({default: undefined, type: Array}) defaultLabels!: string[]
  @Prop(String) fixedPers!: string
  @Prop(String) fixedLabel!: string
  @Prop(Array) tasks!: Task[]
  @Prop({default: false, type: Boolean}) insertBefore!: boolean

  @Getter isDesktop!: boolean

  sortable: any = null
  numberOfSelected: number = 0
  deselectAll: boolean = false
  added: boolean = false
  rootSelector: string = `.task-${this.group}-${this.id}`
  taskAdderPosition: number = 0

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
    this.getTaskAdderPosition()
    const order = els.filter(el => el !== 'task-adder')
    this.$emit('add', {position: this.taskAdderPosition, order, ...obj})
    this.added = true
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
  getTaskAdderPosition() {
    const els: string[] = this.getIdsFromElements(this.rootSelector)
    let i = 0
    for (const id of els)
      if (id === 'task-adder') {
        this.taskAdderPosition = i
        break
      } else i++
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }

  @Watch('tasks')
  onChange(j: any, l: any) {
    if (this.added && this.insertBefore) {
      setTimeout(() => {
        this.getTaskAdderPosition()
        const childNodes = this.rootComponent.childNodes
        const p = this.taskAdderPosition
        const adder = childNodes[p] as any
        const newTask = childNodes[p + 1]
        this.rootComponent.insertBefore(newTask, adder)
      }, 10)
      this.added = false
    }
  }
}

</script>

<style scoped>

.list-enter {
  transform: scale(1.08,1.18);
}

.list-enter-to {
  transition: transform .4s, background-color .6s;
  transition-timing-function: ease;
  transform: scale(1,1);
  background-color: initial;
}

.list-enter.dark {
  background-color: #191919;
}

.list-enter.light {
  background-color: #f5f5f5;
}

.list-leave-active {
  transition: opacity .5s;
}

.list-leave {
  opacity: 1;
}

.list-leave-to {
  opacity: 0;
}

</style>
