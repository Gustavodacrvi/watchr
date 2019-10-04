<template>
  <div class="AppbarElement rb handle"
    :tabindex="tabindex"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :class="{notSmartActive: !isSmart && isActive}"
    @click="linkCallback(callback)"
  >
    <div
      class="link-wrapper rb"
    >
      <div class="icon-wrapper">
        <Icon class="icon" :style="hoverStyle" :class="{notActive: !isActive}" :icon="icon"/>
      </div>
      <div class="name-wrapper">
        <span class="name" :style="hoverStyle">{{ getName }}</span>
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

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options',
  ],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    Renderer: () => import('./Renderer.vue'),
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
    ...mapGetters(['l']),
    getName() {
      if (this.isSmart) return this.l[this.name]
      return this.name
    },
    hoverStyle() {
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

.sortable-ghost .link-wrapper {
  display: none;
}

.sortable-ghost {
  background-color: var(--void) !important;
  transition-duration: 0 !important;
  transition: none !important;
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
