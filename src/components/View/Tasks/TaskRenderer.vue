<template>
  <div class="TaskRenderer" @click.stop>
    <transition-group name="task-trans" class="task-renderer-root"
      appear
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <Task v-for="t of tasks" :key="t.id"
        :task='t'
        :isSelecting='isSelecting'
        :isSelected='isTaskSelected(t.id)'
        :view='view'
        :viewNameValue='viewNameValue'
        @select='taskSelect'

        :data-id='t.id'
      />
    </transition-group>
  </div>
</template>

<script>

import Vue from 'vue'

import TaskVue from './Task.vue'
import TaskEditTemplate from './Edit.vue'

import { mapState, mapGetters } from 'vuex'

import Sortable from 'sortablejs'

export default {
  props: ['tasks', 'onAdd', 'view', 'addTask', 'viewNameValue'],
  components: {
    Task: TaskVue,
  },
  data() {
    return {
      addedTask: false,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      group: {name: 'task-renderer', pull: false, put: ['action-buttons']},
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

      onUpdate: (evt) => {
        setTimeout(() => {
          this.$emit('update', this.getIds(true))
        }, 100)
      },
      onAdd: (evt) => {
        const item = evt.item
        const type = item.dataset.type
        if (type !== 'addtask')
          item.style.display = 'none'
        if (this.onAdd)
          this.onAdd(evt, item, type)
        if (type === 'addtask') {
          const Constructor = Vue.extend(TaskEditTemplate)
          const instance = new Constructor({
            parent: this,
            propsData: {
              class: 'handle', key: 'Edit',
              placeholder: this.l['Task name'], showCancel: true, btnText: this.l['Add task']
            },
          })
          const el = this.$el.querySelector('.action-button')
          el.setAttribute('id', 'main-button-task')
          instance.$mount('#main-button-task')
          this.$el.getElementsByClassName('Edit')[0].setAttribute('data-id', 'Edit')
          instance.$on('save', (obj) => this.add(obj, evt))
          instance.$on('goup', () => this.moveTaskRenderer('up'))
          instance.$on('godown', () => this.moveTaskRenderer('down'))
          instance.$on('cancel', () => {
            instance.$destroy()
            const $el = instance.$el
            $el.parentNode.removeChild($el)
          })
        }
      },
      onStart: () => window.navigator.vibrate(100),
    })
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.windowClick)
  },
  methods: {
    add(task) {
      this.addTask({
        task, ids: this.getIds(true),
        index: this.getTaskRendererPosition(),
      })
      this.addedTask = true
    },
    getTaskRendererPosition() {
      const ids = this.getIds()
      for (let i = 0;i < ids.length;i++) {
        if (ids[i] === 'Edit')
          return i
      }
    },
    moveTaskRenderer(dire) {
      const i = this.getTaskRendererPosition()
      const childNodes = this.draggableRoot.childNodes
      const adder = childNodes[i]
      let element = null
      if (dire === 'up')
        element = childNodes[i - 1]
      else element = childNodes[i + 1]
      if (element && adder) {
        if (dire === 'up')
          this.draggableRoot.insertBefore(adder, element)
        else
          this.draggableRoot.insertBefore(element, adder)
        const input = adder.getElementsByClassName('input')[0]
        if (input) input.focus()
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
    contWrapper(el) {
      return el.getElementsByClassName('cont-wrapper')[0]
    },
    enter(el) {
      const cont = this.contWrapper(el)
      if (cont) {
        const s = cont.style
        const height = cont.offsetHeight + 'px'
        const lessThan38 = (cont.offsetHeight < 38)
        cont.classList.add('hided')
        s.height = '0px'
        s.padding = '2px 0'
        setTimeout(() => {
          if (lessThan38) {
          cont.classList.add('show')
            s.height = '38px'
          }
          else {
            s.height = height
          }
          s.padding = '0'
          cont.classList.remove('hided')
        })
      }
    },
    leave(el) {
      const cont = el.getElementsByClassName('cont-wrapper')[0]
      if (cont) {
        cont.classList.add('hided-leave')
        cont.style.height = 0
      }
    },
    windowClick() {
      this.$store.commit('clearSelected')
    },
    isTaskSelected(id) {
      return this.selected.includes(id)
    },
    taskSelect(id) {
      if (!this.selected.includes(id))
        this.$store.commit('selectTask', id)
      else {
        this.$store.commit('unselectTask', id)
      }
    },
  },
  computed: {
    ...mapState({
      selected: state => state.selectedTasks,
    }),
    ...mapGetters(['l']),
    draggableRoot() {
      return this.$el.getElementsByClassName('task-renderer-root')[0]
    },
    isSelecting() {
      return this.selected.length > 0
    }
  },
  watch: {
    tasks() {
      if (this.addedTask) {
        setTimeout(() => {
          const i = this.getTaskRendererPosition()
          const childNodes = this.draggableRoot.childNodes
          const adder = childNodes[i]
          const newTask = childNodes[i + 1]
          if (newTask)
            this.draggableRoot.insertBefore(newTask, adder)
        })
      }
      this.addedTask = false
    }
  }
}

</script>

<style scoped>

.TaskRenderer {
  margin-top: 16px;
}

.task-trans-enter, .task-trans-leave-to {
  opacity: 0;
}

.task-trans-leave, .task-trans-enter-to {
  opacity: 1;
}

.task-renderer-root {
  outline: none;
}

</style>
