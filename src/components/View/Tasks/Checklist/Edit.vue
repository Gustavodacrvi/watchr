
<template>
  <transition name="trans" appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Edit" :class="{isDesktopDevice}" @click.stop>
      <div class="wrapper rb">
        <div class="icon-wrapper">
          <Icon
            class="icon primary-hover"
            icon="circle"
            color='var(--primary)'
            width='16px'
          />
        </div>
        <div class="input">
          <InputApp class='sub-edit'
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
    updateString(str) {
      this.name = str
    },
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
      const height = el.offsetHeight + 'px'

      c.transitionDuration = '0s'
      s.transitionDuration = '0s'
      s.width = 0
      c.width = 0
      s.height = 0
      c.height = 0
      c.opacity = 0
      requestAnimationFrame(() => {
        c.transitionDuration = '.2s'
        s.transitionDuration = '.2s'
        s.height = height
        c.height = height
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
  computed: {
    ...mapGetters(['isDesktopDevice']),
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

.Edit.isDesktopDevice .sub-edit {
  padding: 8px;
  padding-left: 0;
}

.icon-wrapper {
  width: 25px;
  flex-basis: 25px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  transform: translateY(2px);
  margin-left: 6px;
}

.input {
  width: 100%;
  padding: 0 8px;
}

.wrapper {
  display: flex;
  background-color: var(--light-sidebar-color);
}

</style>
