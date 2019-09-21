<template>
  <transition name="trans" appear
    @enter="enter"
    @leave="leave"
  >
    <div class="wrapper" @click="$emit('click')">
      <div class="Tag" :style="`border: 1px solid ${color}`">
        <Icon class="icon" :icon="icon" :color="color" width="14px"/>
        <span class="name" :style="{color}">{{ value }}</span>
      </div>
    </div>
  </transition>
</template>

<script>

import IconVue from '../Icon.vue'

export default {
  components: {
    Icon: IconVue,
  },
  props: ['value', 'icon', 'color'],
  data() {
    return {
      height: 0,
      width: 0,
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
      setTimeout(() => {
        el.style.transitionDuration = '.3s'
        name.transitionDuration = '.3s'
        icon.transitionDuration = '.3s'
        setTimeout(() => {
          w.height = this.height + 'px'
          w.width = this.width + 'px'
          setTimeout(() => {
            done()
            name.opacity = '1'
            icon.opacity = '1'
            el.style.opacity = '1'
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
      
      setTimeout(() => {
        el.style.transitionDuration = '.3s'
        w.transitionDuration = '.35s'
        setTimeout(() => {
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
}

</script>

<style scoped>

.wrapper {
  display: block;
}

.Tag {
  border-radius: 100px;
  border: 1px solid var(--white);
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: .5px 12px;
  cursor: pointer;
}

.Tag:hover .icon, .Tag:hover .name {
  color: var(--white) !important;
}

.Tag:hover {
  border: 1px solid var(--white);
}

.icon {
  margin-right: 4px;
  transform: translateY(2px);
}

.name {
  font-size: .8em;
  transition-duration: .2s;
  white-space: nowrap;
}

.Tag {
  margin-right: 4px;
}

</style>
