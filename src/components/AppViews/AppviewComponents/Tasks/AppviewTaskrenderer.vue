<template>
  <div :class='`task-taskrenderer-${id} task-renderer`'>
    <transition-group name='list' class='list' tag='div' :class='[theme, {isempty: tasks.length === 0}]'>
      <view-task v-for='task in tasks'
        class='root-task'
        :key='task.id'
        :task='task'
        :deselect-all='deselectAll'
        :allow-priority='allowPriority'
        :allow-drag='numberOfSelected > 0'

        :data-vid='task.id'

        @toggle='toggleElement'
      />
    </transition-group>
    <transition name='fade'>
      <div v-if='tasks.length === 0 && numberOfAdders === 0' class='no-task round-border gray' :class='theme'>
        <span class='txt' :class='theme'>
          Drag and drop the floating action button to add tasks
        </span>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'
import Mixin from '@/mixins/sortable'

import ViewTask from '@/components/AppViews/AppviewComponents/Tasks/AppviewTask.vue'

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskedit.vue'

Sortable.mount(new MultiDrag(), new AutoScroll())

import { Task, Label } from '../../../../interfaces/app'

@Component({
  components: {
    'view-task': ViewTask,
  },
})
export default class AppviewTaskrenderer extends Mixins(Mixin) {
  @State theme!: string

  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: false, type: Boolean}) fixAdderPosition!: boolean
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
  numberOfAdders: number = 0
  rootSelector: string = `.task-taskrenderer-${this.id}`
  taskAdderPosition: number = 0

  created() {
    this.$on('enter', this.add)
  }
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
      group: {name: 'taskrenderer', pull: false, put: ['floatbutton']},

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements(this.rootSelector, 'root-task')
        this.$emit('update', ids)
      },
      onAdd: (evt: any) => {
        const Constructor = Vue.extend(TaskEditTemplate)
        const instance = new Constructor({
          created() {
            this.$emit('enter')
          },
          parent: this,
          propsData: {
            class: 'handle', key: 'task-adder',
            fixedPers: this.fixedPers, fixedLabel: this.fixedLabel,
            defaultLabels: this.defaultLabels, defaultPriority: this.defaultPriority,
            allowPriority: this.allowPriority, allowLabels: this.allowLabels, lock: true,
          },
        })
        const el = this.rootComponent.querySelector('.main-button') as HTMLElement
        el.setAttribute('id', 'main-button')
        instance.$mount('#main-button')
        this.rootComponent.getElementsByClassName('task-adder')[0].setAttribute('data-vid', 'task-adder')
        this.numberOfAdders++
        instance.$on('enter', this.add)
        instance.$on('cancel', () => {
          instance.$destroy()
          const $el = instance.$el as any
          this.numberOfAdders--
          $el.parentNode.removeChild($el)
        })
      },
    }

    if (!this.isDesktop)
      options['handle'] = '.handle'

    this.sortable = new Sortable(this.rootComponent, options)
  }

  add(obj: {name: string, priority: string}) {
    const els: string[] = this.getIdsFromElements(this.rootSelector, 'root-task')
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
    const els: string[] = this.getIdsFromElements(this.rootSelector, 'root-task')
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
  onChange() {
    if (this.fixAdderPosition && this.added && this.insertBefore) {
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
  position: absolute;
  transition: opacity .5s;
}

.list-leave {
  position: absolute;
  opacity: 1;
}

.list-leave-to {
  opacity: 0;
}

.list.isempty {
  height: 150px;
}

.no-task {
  position: relative;
  top: -150px;
  padding: 0 30px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
