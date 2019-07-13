<template>
  <div :class='`task-${group}-${id}`'>
    <transition-group name='fade'>
      <view-task v-for='task in tasks'
        :key='task.id'
        :task='task'
        :deselect-all='deselectAll'

        :data-vid='task.id'

        @toggle='toggleElement'
      />
      <task-adder
        key='task-adder'
        fixed-tag='Inbox'
        :allow-priority='true'
        @add='add'

        data-vid='task-adder'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import ViewTask from '@/components/AppViews/AppviewComponents/AppviewTask.vue'

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import TaskAdder from '@/components/AppViews/AppviewComponents/AppviewTaskAdder.vue'

Sortable.mount(new MultiDrag(), new AutoScroll())

import { Task } from '../../../interfaces/app'

@Component({
  components: {
    'view-task': ViewTask,
    'task-adder': TaskAdder,
  },
})
export default class AppviewTaskrenderer extends Vue {
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({required: true, type: String}) group!: string
  @Prop({required: true, type: String}) id!: string
  @Prop(Array) tasks!: Task[]

  @Getter isDesktop!: boolean

  sortable: any = null
  numberOfSelected: number = 0
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
      group: this.group,

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements()
        this.$emit('update', ids)
      },
    }

    if (!this.isDesktop)
      options['handle'] = '.handle'

    this.sortable = new Sortable(this.rootComponent, options)
  }

  add(obj: {name: string, priority: string}) {
    const els: string[] = this.getIdsFromElements()
    let i = 0
    let position: number = 0
    for (const id of els) {
      if (id === 'task-adder') {
        position = i
        break
      }
      i++
    }
    let ids = els.filter(el => el !== 'task-adder')
    this.$emit('add', {position, ...obj})
  }
  getIdsFromElements(): string[] {
    const root = document.querySelector(`.task-${this.group}-${this.id}`)
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
    const root = document.querySelector(`.task-${this.group}-${this.id}`)
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
      this.$emit('selected', this.getIdsFromSelectedElements())
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
