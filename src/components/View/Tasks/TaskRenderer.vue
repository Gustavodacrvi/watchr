<template>
  <div class="TaskRenderer" @click.stop>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration" class="illustration">
        <Illustration
          :name='illustration.name'
          :width="illustration.width"
          :title="illustration.title"
          :descr="illustration.descr"
        />
      </div>
    </transition>
    <transition-group name="task-trans" class="front task-renderer-root" :class="{dontHaveTasks: tasks.length === 0}"
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
        :activeTags="activeTags"
        :viewNameValue='viewNameValue'
        @select='taskSelect'

        :data-id='t.id'
        :data-type='`task`'
      />
    </transition-group>
    <transition-group v-if="headings.length > 0"
      appear
      class="front"
      @leave='headingsLeave'
      @enter='headingsEnter'
    >
      <template v-for="h in headings">
        <HeadingApp v-if="getTasks(savedTasks, h).length > 0" :key="h.id"
          :header='h'
          :name='h.name'
          :color='h.color ? h.color : ""'
          :options='h.options ? h.options : []'
        >
          <TaskRenderer
            :tasks='getTasks(savedTasks, h)'
            :view='view'
            :viewNameValue='viewNameValue'
            :activeTags="activeTags"
            :headings='[]'
            :header="h"
            :addTask="h.onAddTask"
            :onAdd='h.onAdd'
          />
        </HeadingApp>
      </template>
    </transition-group>
  </div>
</template>

<script>

import Vue from 'vue'

import TaskVue from './Task.vue'
import TaskEditTemplate from './Edit.vue'
import IllustrationVue from '@/components/Illustrations/Illustration.vue'
import HeadingVue from './../Heading.vue'

import { mapState, mapGetters } from 'vuex'

import Sortable from 'sortablejs'

const lastHeading = {
  id: null,
  tasks: null,
}

export default {
  props: ['tasks', 'header', 'onAdd', 'view', 'addTask', 'viewNameValue', 'headings', 'emptyIcon', 'illustration', 'activeTags'],
  name: 'TaskRenderer',
  components: {
    Task: TaskVue,
    HeadingApp: HeadingVue,
    Illustration: IllustrationVue,
  },
  data() {
    return {
      addedTask: false,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      group: {
        name: 'task-renderer',
        pull: (e,j,item) => {
          const d = item.dataset
          if (d.type === 'task') return true
          return false
        },
        put: (j,o,item) => {
          const d = item.dataset
          if (d.type === 'task') return true
          if (d.type === 'floatbutton') return true
          return false
        }
      },
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
        if (type !== 'floatbutton' && this.onAdd)
          this.onAdd(evt, item, type)
        if (type === 'floatbutton') {
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
    getTasks(tasks, h) {
      if (h.id === lastHeading.id) return lastHeading.tasks
      lastHeading.tasks = h.filter(tasks, h)
      lastHeading.id = h.id
      return lastHeading.tasks
    },
    hideHeading(s) {
      s.height = '0px'
      s.marginBottom = 0
      s.padding = 0
      s.borderBottom = '0px solid var(--light-gray)'
    },
    showHeading(s) {
      s.height = '45px'
      s.marginBottom = '10px'
      s.padding = '0 6px'
      s.borderBottom = '1px solid var(--light-gray)'
    },
    headingsLeave(el) {
      const header = el.getElementsByClassName('header-wrapper')[0]
      const s = header.style
      const sw = el.style
      s.transitionDuration = '0s'
      sw.transitionDuration = '0s'
      sw.margin = '24px 0'
      this.showHeading(s)
      setTimeout(() => {
        s.transitionDuration = '.3s'
        sw.transitionDuration = '.3s'
        sw.margin = 0
        this.hideHeading(s)
      })
    },
    headingsEnter(el) {
      const header = el.getElementsByClassName('header-wrapper')[0]
      const s = header.style
      const sw = el.style
      s.transitionDuration = '0s'
      sw.transitionDuration = '0s'
      sw.margin = 0
      this.hideHeading(s)
      setTimeout(() => {
        s.transitionDuration = '.3s'
        sw.transitionDuration = '.3s'
        sw.margin = '24px 0'
        this.showHeading(s)
      })
    },
    add(task) {
      if (task.name) {
        this.addTask({
          task, ids: this.getIds(true),
          index: this.getTaskRendererPosition(),
          header: this.header,
        })
        this.addedTask = true
      }
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
          s.transition = 'height .2s, opacity .2s, transform .1s'
          if (lessThan38) {
          cont.classList.add('show')
            s.height = '38px'
          }
          else {
            s.height = height
          }
          s.padding = '0'
          cont.classList.remove('hided')
        }, 50)
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
      savedTasks: state => state.task.tasks,
    }),
    ...mapGetters(['l']),
    draggableRoot() {
      return this.$el.getElementsByClassName('task-renderer-root')[0]
    },
    showIllustration() {
      return this.headings.length === 0 && this.tasks.length === 0 && this.illustration
    },
    isSelecting() {
      return this.selected.length > 0
    }
  },
  watch: {
    tasks() {
      setTimeout(() => {
        if (this.addedTask) {
            const i = this.getTaskRendererPosition()
            const childNodes = this.draggableRoot.childNodes
            const adder = childNodes[i]
            const newTask = childNodes[i + 1]
            if (newTask)
              this.draggableRoot.insertBefore(newTask, adder)
        }
        this.addedTask = false
      })
    }
  }
}

</script>

<style scoped>

.illustration {
  position: absolute;
  width: 100%;
  top: 0;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .3s;
}

.front {
  position: relative;
  z-index: 1;
}

.TaskRenderer {
  position: relative;
  margin-top: 16px;
}


.illus-trans-enter, .illus-trans-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.illus-trans-leave, .illus-trans-enter-to {
  opacity: 1;
  transform: translateY(0px);
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

.dontHaveTasks {
  height: 400px;
}

</style>
