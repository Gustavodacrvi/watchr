<template>
  <div class="Scheduler scroll-thin" :class="{mainView, shadow: mainView}">
    <div class="content">
      <div
        class="cal"
        ref='cal'
      >
        <Calendar
          v-model="current"
        
          :allowTaskAdd='true'
        />
      </div>
      <Timeline
        :date='current'
        :mainView='mainView'
      />
    </div>
  </div>
</template>

<script>

import Calendar from "@/components/Scheduling/Calendar.vue"
import Timeline from "@/components/Scheduling/Timeline/Timeline.vue"

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
}

</script>

<style scoped>

.Scheduler {
  max-height: 100%;
  overflow: auto;
}

.mainView {
  padding: 26px;
  border-radius: 8px;
}

.content {
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.cal {
  top: 0;
  z-index: 1;
  background-color: var(--sidebar-color);
}

.mainView, .mainView .cal {
  background-color: var(--card);
}

</style>
