<template>
  <div class="AppbarElement rb"
    :style="hoverStyle"
    :tabindex="tabindex"
    :class="{notSmartActive: !isSmart && isActive}"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="linkCallback(callback)"
  >
    <div
      class="link-wrapper rb"
    >
      <div class="icon-wrapper">
        <Icon class="icon" :class="{notActive: !isActive}" :icon="icon"/>
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
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart',
  ],
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      hover: false,
    }
  },
  methods: {
    linkCallback(callback) {
      if (callback) callback()
    }
  },
  computed: {
    hoverStyle() {
      if (this.isSmart)
        return `color: ${this.isActive ? this.iconColor : ''} !important;`
    },
    isActive() {
      let isActive = this.name === this.active && this.type === this.viewType
      console.log(this.name, this.active, this.type, this.viewTypeth)
      if (this.hover) isActive = true
      return isActive      
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
  margin-top: 1.5px;
  transition: color .2s;
}

.link-wrapper {
  height: 35px;
  cursor: pointer;
  position: relative;
  display: flex;
}

.name {
  transition-duration: .2s;
}

.icon.notActive {
  color: var(--gray);
}

.AppbarElement {
  outline: none;
}

.link-wrapper:hover, .notSmartActive {
  background-color: var(--light-gray);
}

</style>
