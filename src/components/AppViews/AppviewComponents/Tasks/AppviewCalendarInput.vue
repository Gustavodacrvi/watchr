<template>
  <div class='calendar-selection dark card round-border'>
    calendar component
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CalendarInput extends Vue {}

</script>

<style scoped>

.calendar-selection {
  width: 250px;
}

</style>
