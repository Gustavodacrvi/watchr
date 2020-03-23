<template>
  <div class="Scheduler scroll-thin" :class="{mainView, shadow: mainView}">
    <div class="content">
      <div v-if="!mainView"
        class="cal"
        ref='cal'
      >
        <Calendar
          v-model="current"
        
          :allowTaskAdd='true'
        />
      </div>
      <span v-if="!isDesktopDevice" class="calendar-date-wrapper">
        <Icon class="close cursor primary-hover"
          icon='close'
          width='20px'
          :box='true'
          @click.native='$emit("close")'
        />
        <span>
          <Icon class="icon"
            icon='calendar-star'
            color='var(--purple)'
            width='20px'
          />
          <span class="calendar-date">
            {{formatedViewName}}
          </span>
        </span>
      </span>
      <Timeline
        :date='current'
        :mainView='mainView'
        @scroll='scroll'
      />
    </div>
  </div>
</template>

<script>

import Calendar from "@/components/Scheduling/Calendar.vue"
import Timeline from "@/components/Scheduling/Timeline/Timeline.vue"

import utils from '@/utils'

import { mapGetters } from 'vuex'

export default {
  props: ['date', 'mainView'],
  components: {
    Calendar, Timeline,
  },
  data() {
    return {
      current: this.date,
    }
  },
  methods: {
    scroll(num) {
      if (this.mainView)
        this.$el.scrollTop += num
      else this.$emit('scroll', num)
    },
  },
  computed: {
    ...mapGetters(['isDesktopDevice', 'calendarDate']),
    formatedViewName() {
      return utils.getHumanReadableDate(this.calendarDate)
    },
  },
}

</script>

<style scoped>

.Scheduler {
  max-height: 100%;
  overflow: auto;
  position: relative;
}

.mainView {
  padding: 8px 26px;
  border-radius: 8px;
}

.content {
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.cal {
  top: -26px;
  padding-top: 26px;
  z-index: 2;
  background-color: var(--sidebar-color);
  position: sticky;
}

.mainView, .mainView .cal {
  background-color: var(--card);
}

.calendar-date-wrapper {
  position: sticky;
  top: -8px;
  width: 100%;
  height: 85px;
  box-sizing: 100%;
  background-color: var(--card);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4em;
}

.close {
  position: absolute;
  right: 0;
  top: 28px;
}

.icon {
  margin-right: 6px;
  transform: translate(2px, 3px);
}

</style>
