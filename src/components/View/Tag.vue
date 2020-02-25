<template>
  <transition name="trans" appear
    @enter="enter"
    @leave="leave"
  >
    <div class="wrapper" @click="$emit('click')">
      <div class="Tag cursor"
        :class="[{selected, disabled}, layout]"
        :style="{border: selectedBorder}"
        @mouseenter="hover = true"
        @mouseleave="hover = false"
      >
        <Icon class="icon" :icon="icon" :color="color" width="14px"/>
        <span class="name">{{ value }}</span>
        <Icon v-if="extraIcon"
          class="extra-icon"
          :icon="extraIcon"
          :color="color"
          width="10px"
        />
        <CircleBubble
          innerColor='var(--txt)'
          outerColor='white'
          opacity='0'
        />
      </div>
    </div>
  </transition>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: ['value', 'icon', 'color', 'selected', 'disabled', 'extraIcon'],
  data() {
    return {
      height: 0,
      width: 0,
      hover: false,
    }
  },
  methods: {
    enter(el, done) {
      this.height = el.offsetHeight
      this.width = el.offsetWidth

      const { name, icon } = this.getContStyle()
      const w = this.getWrapper()
      name.transitionDuration = '0s'
      icon.transitionDuration = '0s'
      name.opacity = '0'
      w.height = 0 + 'px'
      w.width = 0 + 'px'
      icon.opacity = '0'
      el.style.opacity = '0'
      requestAnimationFrame(() => {
        el.style.transitionDuration = '.3s'
        name.transitionDuration = '.3s'
        icon.transitionDuration = '.3s'
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
          }, 300)
        })
      })
    },
    leave(el, done) {
      const { name, icon } = this.getContStyle()
      const w = this.getWrapper()
      name.opacity = '0'
      icon.opacity = '0'
      el.style.opacity = '0'
      w.height = el.offsetHeight + 'px'
      w.width = el.offsetWidth + 'px'
      
      requestAnimationFrame(() => {
        el.style.transitionDuration = '.3s'
        w.transitionDuration = '.35s'
        requestAnimationFrame(() => {
          w.height = '0px'
          w.width = '0px'
          setTimeout(() => {
            done()
            el.style.transitionDuration = '0s'
          }, 300)
        })
      })
    },
    getWrapper() {
      return this.$el.style
    },
    getContStyle() {
      const name = this.$el.getElementsByClassName('name')[0]
      const icon = this.$el.getElementsByClassName('icon')[0]
      return {name: name.style, icon: icon.style}
    }
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
  height: 22px;
  display: inline-flex;
  align-items: center;
  padding: 1px 14px;
  position: relative;
  overflow: hidden;
  border-radius: 125px;
}

.icon {
  margin-right: 4px;
  transform: translateY(1px);
}

.name {
  font-size: .8em;
  transition-duration: .2s;
  white-space: nowrap;
}

.Tag {
  margin-right: 4px;
  outline: none;
  transition-duration: .2s;
}

.Tag:hover {
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
