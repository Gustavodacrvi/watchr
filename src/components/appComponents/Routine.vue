<template>
  <div v-if='routine' class='routine card-round' :class='$store.state.theme.style'>
    <div class='routine-header'>
      <app-title :no-margin='true' :inline='true' :lvl='3'>{{ routine.name }}</app-title>
      <div class='options'>
        <icon-group class='icon-group' handle='stopwatch' :options="[
          { ico: 'folder-plus', dbclick: false, title: 'Add existing interval', callback: () => console.log(3)},
          { ico: 'pen', dbclick: false, title: 'Create interval', callback: () => console.log('d') },
        ]"></icon-group>
        <icon-group class='icon-group' handle='ellipsis-v' :options="[
          { ico: 'clone', dblclick: false, title: 'Clone routine', callback: () => console.log('dbclick') },
          { ico: 'calendar-minus', dblclick: true, title: 'Remove routine from today', color: 'red', callback: () => console.log('dbclick') },
          { ico: 'trash', dblclick: true, title: 'Delete routine', color: 'red', callback: () => console.log('dbclick') },
        ]"></icon-group>
      </div>
    </div>
    <div class='intervals' ref='intervals-div'>
      <div class='intervals-line' :class='$store.state.theme.style'>
        <interval :selected-interval='interval' id='Exercise' color='#FC7C85' start='20-30' end='22-0' @select="selectInterval"></interval>
      </div>
      <div class='interval-pointer' ref='pointer'></div>
      <div class='numbers'>
        <template v-if='is24HourConvention'>
          <template v-for='i in 25'>
            <span v-if='i !== 25 && i < 11' class='number' :key='i + "routine24"' :style="`left: ${(i - 1) * 117}px`">{{ i - 1 }}</span>
            <span v-else-if='i !== 25 && i > 10' class='number' :key='i  + "routine24"' :style="`left: ${((i - 1) * 117) - 3}px`">{{ i - 1 }}</span>
            <span v-else class='number' :key='i  + "routine24"' style='left: 2808px'>0</span>
          </template>
        </template>
        <template v-else>
          <template v-for='i in 12'>
            <span v-if='i !== 1' class='number' :key='i  + "routine12am"' :style='`left: ${(i - 1) * 117}px`'>{{ i - 1 }}am</span>
            <span v-else class='number' :key='i  + "routine12am"'>12am</span>
          </template>
          <template v-for='i in 13'>
            <span v-if='i === 13' class='number' :key='i  + "routine12am"' style='left: 2808px'>12am</span>
            <span v-else-if='i !== 1' class='number' :key='i  + "routine12pm"' :style='`left: ${((i - 1) * 117) + 1200}px`'>{{ i - 1 }}pm</span>
            <span v-else class='number' :key='i  + "routine12pm"' style='left: 1200px'>12pm</span>
          </template>
        </template>
      </div>
      <icon ref='angle' v-show='interval !== undefined' class='angle color' sz='big' ico='angle-up'></icon>
    </div>
  </div>
  <div v-else class='routine no-routine' :class='$store.state.theme.style'>
    <span>There are no routines today</span>
    <div class='routine-icons'>
      <icon class='pointer' sz='big-big' ico='folder-plus' title='Add bind existing routine'></icon>
      <icon class='pointer' @click='$store.dispatch("app/addTemporaryRoutine", getCurrentDate)' sz='big-big' ico='pen' title='Create routine'></icon>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Routine, Interval } from '@/components/interfaces';
import { app } from '@/components/mixins';
import Heading from '@/components/generalComponents/Heading.vue';
import Icon from '@/components/generalComponents/Icon.vue';
import IconGroup from '@/components/dropdown/IconGroup.vue';
import RoutineInterval from '@/components/appComponents/RoutineInterval.vue';
import mixins from 'vue-typed-mixins';

export default mixins(app).extend({
  mixins: [app as any],
  components: {
    'icon': Icon,
    'app-title': Heading,
    'icon-group': IconGroup,
    'interval': RoutineInterval,
  },
  props: {
    id: String,
  },
  created() {
    if (this.routine) {
      this.intervalId = setInterval(() => {
        this.getTime();
      }, 500);
      this.getTime();
    }
  },
  mounted() {
    if (this.routine) {
      this.setPointer();
      const intervals: any = this.$refs['intervals-div'];
      intervals.addEventListener('scroll', this.saveScrollPosition);
      intervals.scrollLeft = localStorage.getItem('watchrRoutineScroll');
    }
  },
  data() {
    return {
      intervalId: undefined as any,
      routine: this.$store.getters['app/getRoutine'](this.id),
      hour: new Date().getHours() as number,
      min: new Date().getMinutes() as number,
      interval: undefined,
    };
  },
  methods: {
    getTime() {
      this.hour = new Date().getHours();
      this.min = new Date().getMinutes();
    },
    saveScrollPosition(event: any) {
      localStorage.setItem(`watchrRoutineScroll`, '' + event.target.scrollLeft);
    },
    setPointer() {
      const pointer: any = this.$refs.pointer;
      pointer.style.left = this.parseTimeToPixels(`${this.hour}-${this.min}`) + 'px';
    },
    selectInterval(obj: any) {
      this.interval = obj.id;
      const angle: any = this.$refs.angle;
      angle.$el.style.left = obj.position + 'px';
    },
  },
  computed: {
    is24HourConvention(): boolean {
      return (this.$store.state.app.options.clockConvention === '24');
    },
  },
  watch: {
    min() {
      this.setPointer();
    },
    interval(newId: string) {
      this.$emit('interval-selected', newId);
    },
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
    const intervals: any = this.$refs['intervals-div'];
    intervals.removeEventListener('scroll', this.saveScrollPosition);
  },
});
</script>

<style scoped>

.intervals-line.light {
  background-color: #F1F1F3;
}

.intervals-line.dark {
  background-color: #363636;
}

.no-routine.light {
  background-color: #e9e4e2;
}

.no-routine.dark {
  background-color: #1C1C1C;
}

.routine {
  height: 110px;
  padding: 14px;
  padding-bottom: 6px;
  display: flex;
  flex-direction: column;
}

.routine-icons {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.routine-icons .icon {
  margin: 4px;
}

.no-routine {
  border-style: dashed;
  border-radius: 12px;
  color: #ADADAD;
  display: flex;
  justify-content: center;
  align-items: center;
}

.options {
  float: right;
  clear: right;
}

.icon-group {
  margin: 4px;
}

.intervals {
  position: relative;
  height: 100%;
  overflow: auto;
}

.intervals::-webkit-scrollbar {
  height: 5px;
}
 
.intervals::-webkit-scrollbar-thumb {
  background-color: #A97CFC;
  border-radius: 12px;
}

.intervals-line {
  position: absolute;
  top: 40%;
  left: 3px;
  transform: translateY(-50%);
  height: 15px;
  width: 2808px;
  border-radius: 12px;
}

.numbers {
  position: absolute;
  top: 51%;
  width: 2808px;
}

.number {
  position: absolute;
  font-size: 0.8em;
}

.interval-pointer {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  height: 28px;
  width: 2.5px;
  background-color: #A97CFC;
}

.angle {
  position: relative;
  top: 65%;
  left: 0;
  transition: left .5s;
}

@media screen and (min-width: 824px) {
  .intervals::-webkit-scrollbar {
    height: 12px;
  }
}

</style>
