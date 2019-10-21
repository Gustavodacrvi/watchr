<template>
  <div class="Checklist" :class="{hasAtLeastOnSubTask}">
    <SubtaskEdit v-if="test"/>
    <transition-group name="trans" appear
      @enter='enter'
      @leave='leave'
    >
      <Subtask v-for="sub in render"
        :key="sub.id"
        v-bind='sub'
        @toggle='toggle(sub.id)'
      />
    </transition-group>
  </div>
</template>

<script>

import Subtask from './Subtask.vue'
import EditVue from './Edit.vue'

export default {
  props: ['toggleChecklist', 'order', 'list'],
  components: {
    Subtask,
    SubtaskEdit: EditVue,
  },
  data() {
    return {
      test: false,
      render: [
        {
          name: 'I am a subtask mother fucker',
          id: 'asdfas',
          completed: false,
        },
        {
          name: 'I am completed',
          id: 'asdf',
          completed: true,
        },
      ],
    }
  },
  created() {
    setInterval(() => this.test = !this.test, 2000)
    /*     setInterval(() => {
      if (this.render.length === 0)
        this.render = [
        {
          name: 'I am a subtask mother fucker',
          id: 'asdfsa'
        },
        {
          name: 'I am completed',
          id: 'asdf',
          completed: true,
        },
      ]
      else this.render = []
    }, 3000) */
  },
  methods: {
    toggle(id) {
      const subtask = this.render.find(el => el.id === id)
      subtask.completed = !subtask.completed
    },
    enter(el) {
      const s = el.style
      const height = el.offsetHeight

      s.transitionDuration = '0s'
      setTimeout(() => {
        s.transitionDuration = '.2s'
        if (height < 36)
          s.height = '36px'
        else s.height = height + 'px'
      })
    },
    leave(el) {
      el.style.height = 0
    }
  },
  computed: {
    hasAtLeastOnSubTask() {
      return this.render.length > 0
    }
  }
}

</script>

<style scoped>

.Checklist {
  margin: 0;
  padding-left: 8px;
  transition: margin .2s;
}

.hasAtLeastOnSubTask {
  margin: .20px 0;
}

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

</style>
