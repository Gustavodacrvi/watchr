<template>
  <div class="SlimModeNav" :class="{render}">
    <div
      class="active-el rb"
    >
      <span
        class="name"
        :class="{active}"
        @click.stop="active = !active"
      >{{ viewNameValue }}</span>
    </div>
    <transition name="side-t">
      <Sidebar v-if="active"
        ref="side"
        class="Sidebar-comp"
        :value='viewNameValue'
        width='100%'
        :slimMode='true'
        :sidebarHided='false'
        :pressingHandle='false'
        :disableSearch='true'
        :removeHandle='true'
        :removeBacklayer='true'
        :removeFooter='true'
      />
    </transition>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import Sidebar from "@/components/Sidebar/Sidebar.vue"

export default {
  components: {
    Sidebar,
  },
  props: ['render', 'viewNameValue'], 
  data() {
    return {
      active: false,
    }
  },
  methods: {
    click(evt) {
      const path = event.path || (event.composedPath && event.composedPath())
      let found = false
      for (const e of path)
        if (this.$refs.side && this.$refs.side.$el === e) {
          found = true
          break
        }
      if (!found)
        this.active = false
    },
  },
  computed: {
    ...mapGetters(['getIcon']),
  },
  watch: {
    active() {
      if (this.active)
        window.addEventListener('click', this.click)
      else
        window.removeEventListener('click', this.click)
    },
    getIcon() {
      this.active = false
    },
  },
}

</script>

<style scoped>

.Sidebar-comp {
  transform: translateY(50px);
}

.active-el {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.SlimModeNav {
  margin: 0;
  position: relative;
  transition: margin .4s;
  transform: translateY(0px);
  z-index: 5000;
}

.SlimModeNav.render {
  margin-bottom: 20px;
  transform: translateY(-20px);
}

.SlimModeNav.render .active-el {
  height: 35px;
  opacity: 1;
}

.slim-sidebar {
  position: absolute;
  top: 0;
  width: 100%;
}

.name {
  padding: 0 16px;
  height: 100%;
  flex-basis: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  transition-duration: .2s;
  transform: scale(1,1);
  background-color: var(--back-color);
}

.name:hover, .active {
  background-color: var(--light-gray);
}

.icon-wrapper {
  flex-basis: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(1.5px);
}

.side-t-enter, .side-t-leave-to {
  transform: translateY(0px);
  opacity: 0;
  transition-duration: .2s;
}

.side-t-leave, .side-t-enter-to {
  transform: translateY(50px);
  opacity: 1;
  transition-duration: .2s;
}

</style>
