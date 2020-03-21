<template>
  <div class="Scheduler scroll-thin" :class="{mainView}">
    <div class="content">
      <div
        class="cal"
        ref='cal'
      >
        <Calendar
          v-model="date"
        
          :allowTaskAdd='true'
        />
      </div>
      <Timeline :date='date'/>
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
}

</script>

<style scoped>

.Scheduler {
  max-height: 100%;
  overflow: auto;
}

.mainView {
  background-color: var(--sidebar-color);
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

</style>
