<template>
  <div class="Checklist" :class="{hasAtLeastOnSubTask}">
    <transition-group name="trans"
      @enter='enter'
      @leave='leave'
    >
      <Subtask v-for="sub in render"
        :key="sub.id"
        v-bind='sub'
      />
    </transition-group>
  </div>
</template>

<script>

import Subtask from './Subtask.vue'

export default {
  props: ['toggleChecklist', 'order', 'list'],
  components: {
    Subtask,
  },
  data() {
    return {
      render: [
        {
          name: 'I am a subtask mother fucker',
          id: 'asdf'
        },
      ],
    }
  },
  created() {
    setInterval(() => {
      if (this.render.length === 0)
        this.render = [
        {
          name: 'I am a subtask mother fucker',
          id: 'asdf'
        },
      ]
      else this.render = []
    }, 2000)
  },
  methods: {
    enter(el) {
      const s = el.style
      const height = s.offsetHeight

      s.transitionDuration = '0s'
      setTimeout(() => {
        s.transitionDuration = '.2s'
        if (height < 36)
          s.height = '35px'
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
  margin: 20px 0;
}

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

</style>
