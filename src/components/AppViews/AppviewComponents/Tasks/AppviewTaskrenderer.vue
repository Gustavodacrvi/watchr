<template>
  <div :class='`task-taskrenderer-${id} task-renderer`'>
    <transition-group
      name='list'
      class='list'
      tag='div'
      :class='[theme, {isempty: tasks.length === 0}]'
      :data-sortfrom='listType'
      :data-date='date'
    >
      <view-task v-for='task in tasks'
        class='root-task'
        :key='task.id'
        :task='task'
        :deselect-all='deselectAll'
        :allow-drag='numberOfSelected > 0'
        :dragging='dragging'
        :always-show-last-edit-date='alwaysShowLastEditDate'
        :always-show-creation-date='alwaysShowCreationDate'
        :always-show-task-labels='alwaysShowTaskLabels'
        :fixed-pers='fixedPers'

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
import { Getter, State, Mutation, namespace } from 'vuex-class'
import Mixin from '@/mixins/sortable'

const task = namespace('task')

import ViewTask from '@/components/AppViews/AppviewComponents/Tasks/AppviewTask.vue'

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskedit.vue'

Sortable.mount(new MultiDrag(), new AutoScroll())

import moment from 'moment-timezone'

import { Task, Label } from '../../../../interfaces/app'
import { IndexState, IndexMutations } from '../../../../interfaces/store/index'
import { TaskActions } from '../../../../interfaces/store/task'

@Component({
  components: {
    'view-task': ViewTask,
  },
})
export default class AppviewTaskrenderer extends Mixins(Mixin) {
  @State theme!: IndexState.theme
  @Mutation hideExtraActions!: IndexMutations.HideExtraActions
  @Mutation showExtraActions!: IndexMutations.ShowExtraActions

  @task.Action saveNewDateOfTasks!: TaskActions.SaveNewDateOfTasks

  @Prop(Boolean) disabled!: boolean
  @Prop(Boolean) fixAdderPosition!: boolean
  @Prop(Boolean) allowPriority!: boolean
  @Prop(Boolean) allowLabels!: boolean
  @Prop(Boolean) alwaysShowLastEditDate!: boolean
  @Prop(Boolean) alwaysShowCreationDate!: boolean
  @Prop(Boolean) alwaysShowTaskLabels!: boolean
  @Prop(Boolean) allowDate!: boolean
  @Prop(Boolean) listHasDates!: boolean
  @Prop({default: undefined, type: String}) defaultPriority!: string
  @Prop({default: undefined, type: String}) defaultDate!: string
  @Prop({default: undefined, type: Array}) defaultLabels!: string[]
  @Prop({required: true, type: String}) id!: string
  @Prop(String) fixedPers!: string
  @Prop(String) fixedLabel!: string
  @Prop(String) date!: string
  @Prop(String) listType!: string
  @Prop(Array) tasks!: Task[]
  @Prop({default: false, type: Boolean}) insertBefore!: boolean

  @Getter isDesktop!: boolean

  sortable: any = null
  numberOfSelected: number = 0
  deselectAll: boolean = false
  added: boolean = false
  dragging: boolean = false
  numberOfAdders: number = 0
  rootSelector: string = `.task-taskrenderer-${this.id}`
  taskAdderPosition: number = 0
  actionType: string = ''

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

  getIds(evt: any): string[] {
    const els = evt.items
    if (els.length === 0)
      els.push(evt.item)
    const arr = []
    for (const e of els)
      arr.push(e.dataset.vid)
    return arr
  }
  mount() {
    const options: any = {
      disabled: this.disabled,
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: true,
      dataIdAttr: 'data-sortableid',
      group: {name: 'taskrenderer', pull: (to: any, from: any) => {
        if (to.options.group.name === 'today-btn') {
          this.actionType = 'today-btn'
          return false
        } else if (to.options.group.name === 'tomorrow-btn') {
          this.actionType = 'tomorrow-btn'
          return false
        }
        this.actionType = ''
        return false
      }, put: ['floatbutton', 'taskrenderer']},

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements(this.rootSelector, 'root-task')
        this.$emit('update', ids)
      },
      onAdd: (evt: any) => {
        const type = evt.from.dataset.sortfrom
        if (type === 'actionbutton') {
          const Constructor = Vue.extend(TaskEditTemplate)
          const instance = new Constructor({
            created() {
              this.$emit('enter')
            },
            parent: this,
            propsData: {
              class: 'handle', key: 'task-adder',
              fixedPers: this.fixedPers, fixedLabel: this.fixedLabel,
              defaultLabels: this.defaultLabels, defaultPriority: this.defaultPriority, defaultDate: this.defaultDate,
              allowPriority: this.allowPriority, allowLabels: this.allowLabels, lock: true, allowDate: this.allowDate,
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

        } else if (type === 'date' && this.listHasDates) {
          const els = evt.items
          if (els.length === 0)
            els.push(evt.item)
          const arr = []
          for (const e of els)
            arr.push({
              date: evt.target.dataset.date,
              id: e.dataset.vid,
            })
          this.$emit('savenewdates', arr)
        }
      },
      onStart: () => {
        this.dragging = true
        this.showExtraActions()
      },
      onEnd: (evt: any) => {
        switch (this.actionType) {
          case 'today-btn': {
            const arr = []
            const ids = this.getIds(evt)
            for (const id of ids)
              arr.push({
                id, date: moment.utc().format('Y-M-D'),
              })
            this.saveNewDateOfTasks(arr)
            break
          }
          case 'tomorrow-btn': {
            const arr = []
            const ids = this.getIds(evt)
            for (const id of ids)
              arr.push({
                id, date: moment.utc().add(1, 'd').format('Y-M-D'),
              })
            this.saveNewDateOfTasks(arr)
            break
          }
        }
        this.actionType = ''
        this.dragging = false
        this.hideExtraActions()
      },
    }

    if (!this.isDesktop)
      options['handle'] = '.handle'

    this.sortable = new Sortable(this.rootComponent, options)
  }

  add(obj: {name: string, priority: string, utc: {time: string, date: string}}) {
    const els: string[] = this.getIdsFromElements(this.rootSelector, 'root-task')
    this.getTaskAdderPosition()
    const order = els.filter(el => el !== 'task-adder')
    if (this.listHasDates) {
      if (!obj.utc) obj['utc'] = {
        time: '', date: '',
      }
      obj.utc.date = this.rootComponent.dataset.date as any
    }
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
    if (this.numberOfSelected === 0)
      window.navigator.vibrate(50)
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

.task-renderer {
  position: relative;
}

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
  width: 100%;
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
