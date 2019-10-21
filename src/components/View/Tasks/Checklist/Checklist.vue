<template>
  <div class="Checklist" :class="{hasAtLeastOnSubTask}">
    <transition-group name="trans" appear
      class="draggable-root"
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <Subtask v-for="sub in getList"
        :key="sub.id"
        v-bind='sub'
        @toggle='toggleTask(sub.id)'
        @remove='remove(sub.id)'
        @save='str => sub.name = str'

        :data-id='sub.id'
      />
    </transition-group>
  </div>
</template>

<script>

import Vue from 'vue'

import Subtask from './Subtask.vue'
import EditVue from './Edit.vue'

import Sortable from 'sortablejs'

import utils from '@/utils/'

export default {
  props: ['order', 'list', 'toggle'],
  components: {
    Subtask,
    SubtaskEdit: EditVue,
  },
  mounted() {
    this.calculateLeastNumberOfTasks()
    window.addEventListener('click', this.calculateLeastNumberOfTasks)
    const sortable = new Sortable(this.draggableRoot, {
      group: {name: 'sub-task-renderer',
        put: (j,o,item) => {
          const d = item.dataset
          if (d.type === 'floatbutton') return true
          return false
        }
      },
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

      onUpdate: () => {
        this.$emit('update', this.getIds(true))
      },
      onAdd: (evt) => {
        const item = evt.item
        const type = item.dataset.type

        if (type === 'floatbutton') {
          const ins = this.taskAdderInstance()

          const el = this.$el.querySelector('.action-button')
          el.setAttribute('id', 'edit-subtask-task-renderer')
          ins.$mount('#edit-subtask-task-renderer')
          this.$el.getElementsByClassName('Edit')[0].setAttribute('data-id', 'Edit')
          this.applyTaskAdderEventListeners(ins)
        }
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('click', this.calculateLeastNumberOfTasks)
  },
  data() {
    return {
      addedTask: true,
      hasAtLeastOnSubTask: false,
    }
  },
  methods: {
    applyTaskAdderEventListeners(ins) {
      ins.$on('add', this.addSubtask)
      ins.$on('goup', () => this.moveTaskRenderer('up'))
      ins.$on('godown', () => this.moveTaskRenderer('down'))
      const hide = () => {
        ins.$destroy()
        const $el = ins.$el
        $el.parentNode.removeChild($el)
        window.removeEventListener('click', hide)
      }
      window.addEventListener('click', hide)
    },
    toggleTask(id) {
      const subtask = this.list.find(el => el.id === id)
      subtask.completed = !subtask.completed
    },
    remove(id) {
      this.$emit("remove", id)
      setTimeout(() => {
        this.calculateLeastNumberOfTasks()
      }, 210)
    },
    enter(el) {
      if (this.addedTask)
        this.fixTaskRenderer()
      const s = el.style
      const height = el.offsetHeight

      s.transitionDuration = '0s'
      s.height = 0
      setTimeout(() => {
        s.transitionDuration = '.2s'
        if (height < 36)
          s.height = '36px'
        else s.height = height + 'px'
      }, 10)
    },
    leave(el) {
      el.style.height = 0
    },
    addSubtaskAdderBegin() {
      setTimeout(() => {
        const ins = this.taskAdderInstance()
        const el = document.createElement('div')
        el.setAttribute('id', 'edit-subtask-task-renderer')
        this.draggableRoot.appendChild(el)
        ins.$mount('#edit-subtask-task-renderer')
        this.$el.getElementsByClassName('Edit')[0].setAttribute('data-id', 'Edit')
        this.applyTaskAdderEventListeners(ins)
      })
    },
    moveTaskRenderer(dir) {
      console.log('move task renderer', name)
    },
    fixTaskRenderer() {
      setTimeout(() => {
        const i = this.getTaskRendererPosition()
        const childNodes = this.draggableRoot.childNodes
        const adder = childNodes[i]
        const newTask = childNodes[i + 1]
        if (newTask)
          this.draggableRoot.insertBefore(newTask, adder)
        this.addedTask = false
      }, 10)
    },
    addSubtask(name) {
      this.addedTask = true
      this.$emit('add', {
        name, ids: this.getIds(true),
        index: this.getTaskRendererPosition(),
      })
    },
    getTaskRendererPosition() {
      const ids = this.getIds()
      for (let i = 0;i < ids.length;i++) {
        if (ids[i] === 'Edit')
          return i
      }
    },
    getIds(removeAdders) {
      const childs = this.draggableRoot.childNodes
      let ids = []
      for (const el of childs)
        ids.push(el.dataset.id)
      if (removeAdders)
        ids = ids.filter(id => id !== 'Edit')
      return ids
    },
    taskAdderInstance() {
      const Constructor = Vue.extend(EditVue)
      return new Constructor({
        parent: this,
      })
    },
    calculateLeastNumberOfTasks() {
      setTimeout(() => {
        if (!this.$el) this.hasAtLeastOnSubTask = false
        const childs = this.draggableRoot.childNodes
        this.hasAtLeastOnSubTask = childs && childs.length > 0
      })
    },
  },
  computed: {
    draggableRoot() {
      return this.$el.getElementsByClassName('draggable-root')[0]
    },
    getList() {
      return utils.checkMissingIdsAndSortArr(this.order, this.list)
    },
  },
  watch: {
    toggle() {
      if (this.getList && this.getList.length === 0)
        this.addSubtaskAdderBegin()
      this.calculateLeastNumberOfTasks()
    },
    list() {
      this.calculateLeastNumberOfTasks()
    }
  }
}

</script>

<style scoped>

.Checklist {
  margin: 0;
  padding: 0 8px;
  transition: margin .2s;
}

.hasAtLeastOnSubTask {
  margin: 20px 0;
}

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

.sortable-ghost {
  background-color: var(--back-color) !important;
  transition-duration: 0;
  transition: none;
  height: 38px;
  padding: 0;
}

</style>
