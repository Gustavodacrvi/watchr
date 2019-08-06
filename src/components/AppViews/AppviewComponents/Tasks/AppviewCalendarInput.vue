<template>
  <div class='calendar-selection dark card round-border'>
    <div class='drop'>
      <div class='el cancel-sortable-unselect dark'>
        <span class='el-icon'><i class='txt fas fa-star fa-lg'></i></span>
        <span class='el-name txt dark'>Start</span>
      </div>
      <div class='el cancel-sortable-unselect dark'>
        <span class='el-icon'><i class='txt fas fa-sun fa-lg'></i></span>
        <span class='el-name txt dark'>Tomorrow</span>
      </div>
      <div class='el cancel-sortable-unselect dark'>
        <span class='el-icon'><i class='txt fas fa-calendar-week fa-lg'></i></span>
        <span class='el-name txt dark'>Next week</span>
      </div>
    </div>
    <div class='calendar-header'>
      <div class='header-row'>
        <span class='txt dark'>
          Aug 2019
        </span>
        <span class='select'>
          <i class='fas fa-angle-left fa-sm icon icon-calendar dark'></i>
          <i class='fas fa-circle fa-sm icon icon-calendar dark'></i>
          <i class='fas fa-angle-right fa-sm icon icon-calendar dark'></i>
        </span>
      </div>
      <div class='header-row'>
        <span class='txt dark'>S</span>
        <span class='txt dark'>M</span>
        <span class='txt dark'>T</span>
        <span class='txt dark'>W</span>
        <span class='txt dark'>T</span>
        <span class='txt dark'>F</span>
        <span class='txt dark'>S</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class CalendarInput extends Vue {}

</script>

<style scoped>

.calendar-selection {
  width: 275px;
  overflow: hidden;
}

.drop {
  margin: 8px;
}

.calendar-header {
  margin: 0 12px;
}

.header-row {
  justify-content: space-between;
  display: flex;
}

.header-row + .header-row {
  margin: 8px 0;
}

.icon-calendar + .icon-calendar {
  margin-left: 14px;
}

</style>

<style scoped src='@/assets/css/drop.css'></style>
