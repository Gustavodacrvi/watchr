<template>
  <div class="SlimModeNav" :class="{render, mobile: !isDesktopDevice}">
    <transition name="side-t">
      <component v-if="active"
        :is='getComp'

        :date='calendarDate'
        :mainView='true'
      
        ref="side"
        class="Sidebar-comp"
        :value='viewName'
        width='100%'
        :slimMode='true'
        :sidebarHided='false'
        :pressingHandle='false'
        :disableSearch='true'
        :removeHandle='true'
        :removeBacklayer='true'

        @close='close'
      />
    </transition>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import Sidebar from "@/components/Sidebar/Sidebar.vue"
import Scheduler from '@/components/Scheduling/SchedulerTimeline.vue'

export default {
  components: {
    Sidebar,
    Scheduler,
  },
  props: ['scheduling', 'render', 'viewName'], 
  data() {
    return {
      active: false,
    }
  },
  methods: {
    close() {
      this.active = false
    },
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
        this.close()
    },
  },
  computed: {
    ...mapGetters(['calendarDate', 'isDesktopDevice']),
    getComp() {
      return this.scheduling ? 'Sidebar' : 'Scheduler'
    },
  },
  watch: {
    active() {
      if (this.active)
        window.addEventListener('click', this.click)
      else
        window.removeEventListener('click', this.click)
    },
    viewName() {
      this.close()
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
  transition-duration: .15s;
}

.side-t-leave, .side-t-enter-to {
  transform: translateY(5px);
  opacity: 1;
  transition-duration: .15s;
}

.mobile {
  margin-top: -12px;
}

</style>
