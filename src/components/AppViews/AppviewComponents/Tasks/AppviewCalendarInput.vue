<template>
  <div class='calendar-selection dark card round-border'>
    <div class='el cancel-sortable-unselect dark'>
      <span class='el-icon'><i class='txt fas fa-star fa-lg' style='color: #FFE366'></i></span>
      <span class='el-name txt dark'>Start</span>
    </div>
    <div class='el cancel-sortable-unselect dark'>
      <span class='el-icon'><i class='txt fas fa-sun fa-lg' style='color: #FF7B66'></i></span>
      <span class='el-name txt dark'>Tomorrow</span>
    </div>
    <div class='el cancel-sortable-unselect dark'>
      <span class='el-icon'><i class='txt fas fa-calendar-week fa-lg' style='color: #88DDB7'></i></span>
      <span class='el-name txt dark'>Next week</span>
    </div>
    <div class='drop'>
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
        <div class='header-row weeks'>
          <span class='txt dark week'>S</span>
          <span class='txt dark week'>M</span>
          <span class='txt dark week'>T</span>
          <span class='txt dark week'>W</span>
          <span class='txt dark week'>T</span>
          <span class='txt dark week'>F</span>
          <span class='txt dark week'>S</span>
        </div>
      </div>
      <div class='dates'>
        <span class='txt dark date'><span class='number'>1</span></span>
        <span class='txt dark date'><span class='number'>2</span></span>
        <span class='txt dark date'><span class='number'>3</span></span>
        <span class='txt dark date'><span class='number'>4</span></span>
        <span class='txt dark date'><span class='number'>5</span></span>
        <span class='txt dark date'><span class='number'>6</span></span>
        <span class='txt dark date'><span class='number'>7</span></span>
        <span class='txt dark date'><span class='number'>8</span></span>
        <span class='txt dark date'><span class='number'>9</span></span>
        <span class='txt dark date'><span class='number'>10</span></span>
        <span class='txt dark date'><span class='number'>11</span></span>
        <span class='txt dark date'><span class='number'>12</span></span>
        <span class='txt dark date'><span class='number'>13</span></span>
        <span class='txt dark date'><span class='number'>14</span></span>
        <span class='txt dark date'><span class='number'>15</span></span>
        <span class='txt dark date'><span class='number'>16</span></span>
        <span class='txt dark date'><span class='number'>17</span></span>
        <span class='txt dark date'><span class='number'>18</span></span>
        <span class='txt dark date'><span class='number'>19</span></span>
        <span class='txt dark date'><span class='number'>20</span></span>
        <span class='txt dark date'><span class='number'>21</span></span>
        <span class='txt dark date'><span class='number'>22</span></span>
        <span class='txt dark date'><span class='number'>23</span></span>
        <span class='txt dark date'><span class='number'>24</span></span>
        <span class='txt dark date'><span class='number'>25</span></span>
        <span class='txt dark date'><span class='number'>26</span></span>
        <span class='txt dark date'><span class='number'>27</span></span>
        <span class='txt dark date'><span class='number'>28</span></span>
        <span class='txt dark date'><span class='number'>29</span></span>
      </div>
      <span v-if='isDesktop'>
        <form-input class='add-time tiny'
          input-theme='dark'
          :disabled='true'
          placeholder='Add time...'
          v-model='time'
        />
      </span>
      <span v-else class='add-time red'>Add time</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class CalendarInput extends Vue {
  @Getter isDesktop!: boolean
  
  month: number = 1
  time: string = ''
}

</script>

<style scoped>

.el {
  padding-left: 8px;
}

.calendar-selection {
  width: 275px;
  overflow: hidden;
}

.drop {
  margin: 12px;
}

.week {
  width: 20px;
  text-align: center;
}

.weeks {
  font-size: .8em;
}

.dates {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto;
  justify-content: space-between;
}

.header-row {
  display: flex;
  justify-content: space-between;
}

.weeks {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto;
  justify-content: space-between;
}

.add-time {
  margin-top: 4px;
  color: #FF6B66;
}

.date {
  display: inline-block;
  position: relative;
  width: 25px;
  height: 25px;
  text-align: center;
  border-radius: 100px;
  transition: color .3s, background-color .3s;
  cursor: pointer;
}

.number {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.date:hover {
  color: white;
  background-color: #FF6B66;
}

.header-row + .header-row {
  margin: 8px 0;
}

.icon-calendar + .icon-calendar {
  margin-left: 14px;
}

.fa-circle {
  transform: translateY(-2px);
  font-size: .6em;
}

</style>

<style scoped src='@/assets/css/drop.css'></style>
