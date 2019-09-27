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
        @select='taskSelect'

        :data-id='t.id'
      />
    </transition-group>
    <HeadingApp
      name="I am a freaking heading"
    >
      freaking testaçsldjkf 
    </HeadingApp>
  </div>
</template>

<script>

import TaskVue from './Tasks/Task.vue'
import HeadingVue from './Heading.vue'

import { Sortable } from '@shopify/draggable'
import { mapState } from 'vuex'

export default {
  props: ['tasks'],
  components: {
    Task: TaskVue,
    HeadingApp: HeadingVue,
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      draggable: '.draggable',
      handle: '.handle',
      delay: 300,
      mirror: {
        appendTo: 'body',
        constrainDimensions: true,
      },
    })
    this.sortable.on('sortable:stop', (evt) => {
      setTimeout(() => {
        const childs = evt.newContainer.childNodes
        const ids = []
        for (const el of childs) {
          ids.push(el.dataset.id)
        }
        this.$emit('update', ids)
      }, 100)
    })
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.windowClick)
  },
  methods: {
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
