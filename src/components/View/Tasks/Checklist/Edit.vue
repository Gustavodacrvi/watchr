
<template>
  <transition name="trans" appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Edit" @click.stop>
      <div class="wrapper rb">
        <InputApp
          :value='name'
          @input='v => name = v'
          :focus='true'
          placeholder='Subtask name...'

          @keydown.native.stop='keydown'
          @enter='addSubtask'
          @cancel='$emit("cancel")'
          @goup='$emit("goup")'
          @godown='$emit("godown")'
        />
      </div>
    </div>
  </transition>
</template>

<script>

import InputApp from '@/components/Auth/Input.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    InputApp,
  },
  data() {
    return {
      name: '',
    }
  },
  methods: {
    keydown({key}) {
      if (key === 'ArrowUp')
        this.$emit('move-cursor-up')
      else if (key === "ArrowDown")
        this.$emit('move-cursor-down')
    },
    leave(el) {
      const cont = el.getElementsByClassName('wrapper')[0]
      const s = el.style
      const c = cont.style
      const height = el.offsetHeight

      s.width = 0
      c.width = 0
      s.height = 0
      c.height = 0
      c.opacity = 0
    },
    enter(el) {
      const cont = el.getElementsByClassName('wrapper')[0]
      const s = el.style
      const c = cont.style
      const height = el.offsetHeight

      c.transitionDuration = '0s'
      s.transitionDuration = '0s'
      s.width = 0
      c.width = 0
      s.height = 0
      c.height = 0
      c.opacity = 0
      requestAnimationFrame(() => {
        c.transitionDuration = '.15s'
        s.transitionDuration = '.15s'
        if (height < 31) {
          s.height = '30px'
          c.height = '30px'
        }
        else {
          s.height = height + 'px'
          c.height = height + 'px'
        }
        c.opacity = 1
        s.width = '100%'
        c.width = '100%'
      })
    },
    addSubtask() {
      if (this.name)
        this.$emit('add', this.name)
      this.name = ''
    },
  },
}

</script>

<style scoped>

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

.Edit {
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  background-color: var(--dark);
}

</style>
