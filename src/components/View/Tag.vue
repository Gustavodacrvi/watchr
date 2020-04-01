<template>
  <transition name="trans" appear
    @enter="enter"
    @leave="leave"
  >
    <div class="wrapper">
      <div class="Tag cursor" @click="click"
        :class="[{selected, disabled, active}, layout]"
        :style="{border: selectedBorder}"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
      >
        <Icon class="icon" ref='icon' :icon="icon" :color="color" width="14px"/>
        <span class="name" ref='name'>{{ value }}</span>
        <Icon v-if="extraIcon"
          class="extra-icon"
          :icon="extraIcon"
          :color="color"
          width="10px"
        />
      </div>
    </div>
  </transition>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: ['value', 'icon', 'color', 'selected', 'disabled', 'extraIcon', 'active', 'callback'],
  data() {
    return {
      height: 0,
      width: 0,
      hover: false,

      smartIconOptions: [],
    }
  },
  methods: {
    enter(el, done) {
      this.height = el.offsetHeight
      this.width = el.offsetWidth

      const name = this.$refs.name.style
      const icon = this.$refs.icon.style

      const w = el.style
      
      name.transitionDuration = '0s'
      icon.transitionDuration = '0s'
      name.opacity = '0'
      w.height = 0 + 'px'
      w.width = 0 + 'px'
      icon.opacity = '0'
      el.style.opacity = '0'
      requestAnimationFrame(() => {
        el.style.transitionDuration = '.2s'
        name.transitionDuration = '.2s'
        icon.transitionDuration = '.2s'
        requestAnimationFrame(() => {
          w.height = this.height + 'px'
          w.width = this.width + 'px'
          setTimeout(() => {
            done()
            name.opacity = '1'
            icon.opacity = '1'
            el.style.opacity = '1'
            el.style.height = 'auto'
            el.style.width = 'auto'
          }, 200)
        })
      })
    },
    leave(el, done) {
      const name = this.$refs.name.style
      const icon = this.$refs.icon.style

      const w = el.style

      const {height, width} = getComputedStyle(el)

      name.opacity = 1
      icon.opacity = 1

      w.opacity = 1
      w.height = height
      w.width = width

      requestAnimationFrame(() => {
        el.style.transitionDuration = '.2s'
        w.transitionDuration = '.2s'
        name.transitionDuration = '.2s'
        icon.transitionDuration = '.2s'

        name.opacity = 0
        icon.opacity = 0
        w.opacity = 0
        w.height = '0px'
        w.width = '0px'

        setTimeout(done, 205)
      })
    },
    activate() {
      if (this.callback)
        this.smartIconOptions = this.callback()
    },
    click(evt) {
      this.$emit('click')
      this.activate()
    },
    getWrapper() {
      return this.$el.style
    },
  },
  computed: {
    ...mapGetters(['layout']),
    tagColor() {
      return !this.hover ? this.color : ''
    },
    selectedBorder() {
      const color = this.color ? this.color : 'var(--primary)'
      return this.selected ? `1px solid ${color}` : ``
    },
  }
}

</script>

<style scoped>

.wrapper {
  display: block;
}

.Tag {
  border: 1px solid var(--light-gray);
  background-color: var(--dark-gray);
  height: 22px;
  display: inline-flex;
  align-items: center;
  padding: 10px 8px;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}

.icon {
  margin-right: 4px;
  transform: translateY(.5px);
}

.name {
  transition-duration: .2s;
  transform: translateY(-1px);
  white-space: nowrap;
}

.Tag {
  margin-right: 4px;
  outline: none;
  transition-duration: .2s;
}

.Tag:hover, .active {
  background-color: var(--fade);
  background-color: var(--light-gray);
}

.disabled {
  background-color: initial !important;
  opacity: .4;
  color: var(--txt) !important;
}

.extra-icon {
  transform: translate(6px, -1px);
}

</style>
