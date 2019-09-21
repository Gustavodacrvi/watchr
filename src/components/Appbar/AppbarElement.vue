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
        <IconDrop v-if="showOptions"
          class="drop"
          handle="settings-v"
          :options='options'
        />
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options',
  ],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
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
      if (this.hover) isActive = true
      return isActive      
    },
    showOptions() {
      if (!this.options || this.options.length === 0) return false
      if (this.$store.getters.isDesktop) return this.hover
      return true
    }
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
  height: 100%;
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
  height: 35px;
  transition: background-color .2s, height .3s;
}

.link-wrapper:hover, .notSmartActive {
  background-color: var(--light-gray);
}

.drop {
  position: absolute;
  right: 0px;
  top: 50%;
}

</style>
