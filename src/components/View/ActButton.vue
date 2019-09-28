<template>
  <div class="ActButton cb handle" @mouseenter="hover = true" @mouseleave="hover = false" @mousedown="mouseDown = true" @mouseup="mouseDown = false">
    <Icon class="icon"
      :icon="icon"
      :color="color"
    />
    <div class="path" :class="{showingPath}" :style="pathStyle"></div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

export default {
  props: ['icon', 'color'],
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      hover: false,
      mouseDown: false,
    }
  },
  computed: {
    showingPath() {
      return this.hover
    },
    pathStyle() {
      return {
        backgroundColor: this.mouseDown ? 'var(--primary)' : 'var(--light-gray)',
      }
    },
  }
}

</script>

<style>

.ActButton, .path {
  transition-duration: .3s;
}

.ActButton {
  border-radius: 100px;
  cursor: pointer;
  outline: none;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  position: relative;
  overflow: hidden;
  z-index: 10;
}

.ActButton:hover {
  transform: scale(1.1,1.1);
}

.path {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 100%;
  clip-path: circle(0px);
  z-index: 10;
}

.showingPath {
  clip-path: circle(100px);
}

.icon {
  position: relative;
  transform: translateY(2px);
  z-index: 11;
}

</style>
