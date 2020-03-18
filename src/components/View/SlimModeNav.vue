<template>
  <div class="SlimModeNav" :class="{render}">
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
  props: ['scheduling', 'render', 'viewNameValue'], 
  data() {
    return {
      active: false,
    }
  },
  methods: {
    open() {
      this.active = true
    },
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
  transform: translateY(5px);
  pointer-events: all;
}

.SlimModeNav {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  margin: 15px 0;
  box-sizing: border-box;
  transform: translateY(0px);
  z-index: 5000;
  pointer-events: none;
}

.SlimModeNav.render {
  transform: translateY(-5px);
}

.slim-sidebar {
  position: absolute;
  top: 0;
  width: 100%;
}

.side-t-enter, .side-t-leave-to {
  transform: translateY(0px);
  opacity: 0;
  transition-duration: .2s;
}

.side-t-leave, .side-t-enter-to {
  transform: translateY(5px);
  opacity: 1;
  transition-duration: .2s;
}

</style>
