<template>
  <div class="footer" :class="{slimMode, showing}">
    <div class="inner-footer">
      <div class="wrapper">
        <div v-if='showing && isDesktopDevice && showIconDropdown && !slimMode'
          class="scheduler-toggle"
          :class="{scheduleHover}"

          @mouseenter='scheduleHover = true'
          @mouseleave='scheduleHover = false'
          @click='$emit("toggle-scheduling")'
        >
          <Icon
            :icon='!scheduling ? "calendar-star" : "star"'
            :color='scheduleHover ? schedulerToggleColor : "var(--fade)"'
          />
          <span
            class="schedule-msg"
            :style='{color: scheduleHover ? schedulerToggleColor : "var(--fade)"}'
          >
            <span v-if="scheduling" key="2"> Smart views </span>
            <span v-else key='s'> Scheduler </span>
          </span>
        </div>
        <div class="drop" v-if="showIconDropdown && showing && !scheduling">
          <Icon v-for="i in sideIcons" :key='i.icon'
            class="sect-icon cursor remove-highlight primary-hover"
            :icon='i.icon'
            width='12px'
            
            :number='i.number'
            color='var(--fade)'
            @click="i.callback"
          />
          <transition name="icon-t">
            <IconDrop
              width='12px'
              class="right"
              handle='settings-h'
              
              handleColor='var(--fade)'
              :options="getSectionOptions"
            />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import IconDrop from '../../IconDrop/IconDrop.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    IconDrop,
  },
  props: ['showIconDropdown', 'sideIcons', 'render', 'getSectionOptions', 'scheduling', 'slimMode'],
  data() {
    return {
      showing: this.render,
      scheduleHover: false,
      timeout: null,
    }
  },
  computed: {
    ...mapGetters(['isDesktopDevice', 'isDesktopBreakPoint']),
    schedulerToggleColor() {
      return this.scheduling ? 'var(--yellow)' : 'var(--purple)'
    },
  },
  watch: {
    render() {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      if (this.render)
        this.timeout = setTimeout(() => {
          this.showing = true
        }, 500)
      else
        this.showing = false
    },
  },
}

</script>

<style scoped>

.footer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 40px;
  border: none;
  z-index: 100;
  border-top: 1px solid var(--extra-light-gray);
}

.slimMode {
  position: sticky;
  padding: 0;
  width: calc(100% + (26px * 2)) !important;
  transform: translateX(-26px);
  background-color: purple;
  bottom: 0;
}

.sect-icon {
  margin-right: 12px;
}

.footer.mobile {
  bottom: 15px;
  height: 53px;
  width: 100%;
  margin-left: 0;
  border: none;
  padding: 0;
}

.wrapper {
  height: 100%;
  margin: 0 25px;
  position: relative;
}

.inner-footer {
  position: relative;
  background-color: none;
  box-shadow: none;
  transition-duration: 0;
  height: 100%;
}

.footer.showing .inner-footer {
  background-color: var(--sidebar-color);
}

.slimMode .inner-footer {
  background-color: var(--card);
}

.mobile .footer.showing .inner-footer {
  background-color: var(--back-color);
}


.scheduler-toggle {
  position: absolute;
  left: -15px;
  user-select: none;
  top: 50%;
  transform: translateY(-50%) scale(1,1);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  padding: 0 12px;
  border-radius: 4px;
  transition: background-color .15s;
}

.drop {
  position: absolute;
  right: 17px;
  display: flex;
  transform: translate(26px, 13px);
}

.footer.mobile .drop {
  right: unset;
  bottom: 24px;
}

.mobile .drop {
  right: unset;
  left: 0;
}

.scheduler-toggle:hover {
  background-color: var(--back-color);
}

.schedule-msg {
  margin-left: 6px;
  height: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

</style>
