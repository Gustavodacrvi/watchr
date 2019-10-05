<template>
  <div class="AppbarElement rb handle"
    :tabindex="tabindex"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="linkCallback(callback)"
    :class="{notSmartActive: !isSmart && isActive}"
  >
    <div
      class="link-wrapper AppbarElement-link rb"
      :data-type='type'
      :data-color='iconColor'
      :data-disabled='disableAction'
    >
      <div class="icon-wrapper">
        <Icon class="icon" :style="hoverStyle" :class="{notActive: !isActive}" :icon="icon"/>
      </div>
      <div class="name-wrapper">
        <span class="name" :style="hoverStyle">{{ getName }}</span>
        <div class="info">
          <span v-if="importantNumber" class="inf important">{{ importantNumber }}</span>
          <span v-if="totalNumber" class="inf total">{{ totalNumber }}</span>
          <IconDrop v-if="showOptions"
            class="inf drop"
            handle="settings-v"
            :options='options'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options', 'totalNumber', 'importantNumber',
  'disableAction'],
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
    ...mapState(['drag']),
    ...mapGetters(['l']),
    isDraggingOver() {
      return this
    },
    getName() {
      if (this.isSmart) return this.l[this.name]
      return this.name
    },
    hoverStyle() {
      return `color: ${this.isActive ? this.iconColor : ''};`
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
  transition-duration: .2s;
}

.name {
  transition-duration: .2s;
}

.icon.notActive {
  color: var(--gray);
}

.AppbarElement {
  outline: none;
  position: relative;
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
  background-color: var(--light-gray) !important;
}

.info {
  display: flex;
  align-items: center;
  position: absolute;
  right: 6px;
  height: 100%;
}

.inf {
  margin-left: 8px;
}

.drop {
  transform: translate(8px, 13px);
}

.total {
  color: var(--gray);
}

#task-on-hover {
  transform: scale(1.01,1.01);
}

#task-on-hover .inf, #task-on-hover .icon, #task-on-hover .name {
  color: white !important;
}

</style>
