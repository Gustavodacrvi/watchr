<template>
  <div class="AppbarElement rb"
    :style="hoverStyle"
    :tabindex="tabindex"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="callback"
  >
    <div
      class="link-wrapper rb"
    >
      <div class="icon-wrapper">
        <Icon class="icon" :icon="icon"/>
      </div>
      <div class="name-wrapper">
        <span class="name">{{ name }}</span>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex'],
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    hoverStyle() {
      return `color: ${this.hover ? this.iconColor : ''}`
    },
  },
}

</script>

<style scoped>

.icon-wrapper {
  height: 100%;
  width: 40px;
  position: relative;
}

.name-wrapper {
  height: 100%;
  display: inline-flex;
  align-items: center;
}

.icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  margin-top: 2px;
  transition: color .2s;
}

.link-wrapper {
  height: 35px;
  cursor: pointer;
  transition: background-color .2s;
  position: relative;
  display: flex;
}

.AppbarElement {
  outline: none;
}

.link-wrapper:hover {
  background-color: var(--light-gray);
}

</style>
