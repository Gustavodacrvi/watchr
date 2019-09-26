<template>
  <div class="TaskRenderer">
    <transition-group name="task-trans" class="root"
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <Task v-for="t of tasks" :key="t.id"
        :task='t'
      />
    </transition-group>
  </div>
</template>

<script>

import TaskVue from './Tasks/Task.vue'

import { Sortable } from '@shopify/draggable'

export default {
  props: ['tasks'],
  components: {
    Task: TaskVue,
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      draggable: '.draggable',
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
  },
  computed: {
    draggableRoot() {
      return this.$el.getElementsByClassName('root')[0]
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
