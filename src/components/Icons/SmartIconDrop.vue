<template>
  <div class="SmartIconDrop cursor"
    @mouseenter="hover = true"
    @mouseleave="hover = false"

    :class="{active: hover || focus}"
  >
    <div class="wrapper">
      <div class="icon-wrapper" @click="activate">
        <Icon class="icon"
          :icon='icon'
          :width='width || "16px"'
        />
      </div>
      <transition
        :css='false'
        @enter='placeEnter'
        @leave='placeLeave'
      >
        <div v-if="hover || focus" class="placeholder">
          <input class="input"
            v-model="model"
            ref='input'
            :placeholder='placeholder'
            size='1'

            @focus='focus = true'
            @blur='focus = false'
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>

export default {
  props: ['icon', 'placeholder', 'width', 'active', 'trigger'],
  data() {
    return {
      hover: false,
      focus: false,
      model: '',
    }
  },
  methods: {
    placeEnter(el, done) {
      const s = el.style

      const width = getComputedStyle(el).width

      s.transitionDuration = 0
      s.width = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

        s.width = width
        s.opacity = 1

        setTimeout(done, 200)
      })
    },
    placeLeave(el, done) {

      const s = el.style

      s.transitionDuration = '.2s'
      s.width = 0
      s.opacity = 0

      setTimeout(done, 200)

    },
    activate() {
      this.$emit('trigger', this.trigger === 'type' ? () => this.model : null)
    },
  },
  computed: {
    isActive() {
      return this.hover || this.focus
    },
  },
  watch: {
    active() {
      if (this.active) {
        this.focus = true
        this.$nextTick(() => this.$refs.input.focus())
      } else if (!this.active && this.focus)
        this.$refs.input.blur()
    },
    isActive() {
      this.model = ''
    },
    model() {
      if (this.trigger === 'type' && this.model.length > 0)
        this.activate()
    },
  },
}

</script>

<style scoped>

.SmartIconDrop {
  height: 25px;
  padding: 4px;
  display: inline-block;
  border-radius: 6px;
  transition-duration: .2s;
}

.SmartIconDrop.active {
  background-color: var(--light-sidebar-color);
}

.icon-wrapper {
  min-width: 20px;
  display: flex;
  justify-content: center;
}

.icon {
  transform: translateX(-1px);
}

.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
}

.placeholder {
  padding: 0 4px;
  height: 100%;
}

.input {
  padding: 0;
  width: 80px;
  outline: none;
}

</style>
