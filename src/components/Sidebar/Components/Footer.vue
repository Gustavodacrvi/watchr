<template>
  <div class="footer">
    <div class="inner-footer">
      <div v-if='isDesktopDevice && showIconDropdown'
        class="scheduler-toggle passive"
        :class="{scheduleHover}"

        @mouseenter='scheduleHover = true'
        @mouseleave='scheduleHover = false'
        @click='$emit("toggle-scheduling")'
      >
        <Icon
          :icon='!scheduling ? "calendar-star" : "star"'
          :color='scheduleHover ? schedulerToggleColor : "var(--txt)"'
        />
        <span class='schedule-msg'
          :style='{color: scheduleHover ? schedulerToggleColor : "var(--txt)"}'
        >{{ !scheduling ? "Scheduler" : "Smart views" }}</span>
      </div>
      <div class="drop" v-if="showIconDropdown">
        <Icon v-for="i in sideIcons" :key='i.icon'
          class="sect-icon passive cursor remove-highlight primary-hover"
          :icon='i.icon'
          
          :number='i.number'
          color='var(--fade)'
          @click="i.callback"
        />
        <transition name="icon-t">
          <IconDrop
            class="right passive"
            handle='settings-h'
            
            handleColor='var(--fade)'
            :options="getSectionOptions"
          />
        </transition>
      </div>
      <div></div>
      <Icon v-if="isDesktopBreakPoint" icon="arrow" id='sidebar-arrow' class="cursor passive" :class="{hided: !showing}" color="var(--light-gray)" :primary-hover="true"  @click="$emit('toggle-sidebar')"/>
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
  props: ['showIconDropdown', 'sideIcons', 'showing', 'getSectionOptions', 'scheduling'],
  data() {
    return {
      scheduleHover: false,
    }
  },
  computed: {
    ...mapGetters(['isDesktopDevice', 'isDesktopBreakPoint']),
    schedulerToggleColor() {
      return this.scheduling ? 'var(--yellow)' : 'var(--purple)'
    },
  },
}

</script>

<style scoped>

.footer {
  position: absolute;
  left: 0;
  bottom: 0px;
  height: 40px;
  border: none;
  padding: 0 25px;
}

.sect-icon {
  margin-right: 12px;
}

.footer.mobile {
  bottom: 15px;
  height: 53px;
  width: 100%;
  margin-left: 0;
  padding: 0;
}

.mobile .inner-footer {
  box-shadow: 0 -3px 3px black;
}

.inner-footer {
  position: relative;
  background-color: none;
  box-shadow: none;
  transition-duration: 0;
  height: 100%;
}

.showing .inner-footer {
  background-color: var(--sidebar-color);
  box-shadow: 0 -3px 4px var(--sidebar-color);
}

.mobile .showing .inner-footer {
  background-color: var(--back-color);
  box-shadow: 0 -3px 4px var(--back-color);
}


.scheduler-toggle {
  position: absolute;
  left: 50%;
  user-select: none;
  top: 50%;
  transform: translate(-50%, -50%) scale(1,1);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  transition: background-color .2s;
}

.drop {
  position: absolute;
  right: 17px;
  display: flex;
  transform: translate(16px, 10px);
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
}

#sidebar-arrow {
  position: absolute;
  left: 3px;
  transform: translateY(5px) rotate(90deg);
  transition: opacity .3s, left .3s, transform .3s;
}

#sidebar-arrow.hided {
  transform: translateY(5px) rotate(-90deg);
}

</style>
