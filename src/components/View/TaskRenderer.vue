<template>
  <div class="TaskRenderer" @click.stop>
    <transition-group name="task-trans" class="root"
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <Task v-for="t of tasks" :key="t.id"
        :task='t'
        :isSelecting='isSelecting'
        :isSelected='isTaskSelected(t.id)'
        :showCompleted='showCompleted'
        :view='view'
        @select='taskSelect'

        :data-id='t.id'
      />
    </transition-group>
  </div>
</template>

<script>

import TaskVue from './Tasks/Task.vue'

import { mapState } from 'vuex'

import Sortable from 'sortablejs'

export default {
  props: ['tasks', 'onAdd', 'showCompleted', 'view'],
  components: {
    Task: TaskVue,
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      group: 'task-renderer',
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

      onUpdate: (evt) => {
        setTimeout(() => {
          const ids = this.getIds()
          this.$emit('update', ids)
        }, 100)
      },
      onAdd: (evt) => {
        evt.item.style.display = 'none'
        this.onAdd(evt)
      }
    })
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.windowClick)
  },
  methods: {
    getIds() {
      const childs = this.draggableRoot.childNodes
      const ids = []
      for (const el of childs)
        ids.push(el.dataset.id)
      return ids
    },
    enter(el) {
      const cont = el.getElementsByClassName('cont-wrapper')[0]
      cont.transitionDuration = '0s'
      cont.classList.add('task-hided')
      setTimeout(() => {
        cont.transitionDuration = '.3s'
        cont.classList.remove('task-hided')
      })
    },
    leave(el) {
      const cont = el.getElementsByClassName('cont-wrapper')[0]
      if (cont)
        cont.classList.add('task-hided')
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
    draggableRoot() {
      return this.$el.getElementsByClassName('root')[0]
    },
    isSelecting() {
      return this.selected.length > 0
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

.root {
  outline: none;
}

</style>
