<template>
  <div class="TaskRenderer">
    <transition-group class="root"
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
      el.transitionDuration = '0s'
      el.classList.add('task-hided')
      setTimeout(() => {
        el.transitionDuration = '.3s'
        el.classList.remove('task-hided')
      })
    },
    leave(el) {
      el.classList.add('task-hided')
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

.task-hided {
  opacity: 0;
  height: 0;
}

</style>
