<template>
  <div :ref='name' class='interval' v-bind:style='styles'>
    <div class='nameDiv'>
      <span class='name'>{{ name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { app } from '@/components/mixins';

export default Vue.extend({
  props: {
    color: String,
    start: String,
    end: String,
    name: String,
  },
  data() {
    return {
      left: undefined as any,
      width: undefined as any,
    };
  },
  created() {
    this.width = this.getWidth;
    this.left = this.getDistance;
  },
  mounted() {
    const ref: any = this.$refs[this.name];
    ref.style.left = this.left + 'px';
  },
  computed: {
    styles(): object {
      return {
        backgroundColor: this.color,
        boxShadow: `0 1px 3px ${this.color}`,
        width: this.width + 'px',
      };
    },
    getDistance(): string {
      return app.computed.parseTimeToPixels(this.start);
    },
    getWidth(): number {
      const minutes = app.computed.parseTimeToMinutes(this.end) - app.computed.parseTimeToMinutes(this.start);
      return app.computed.parseMinutesToPixels(minutes);
    },
  },
});
</script>

<style scoped>

.interval {
  position: absolute;
  height: 95%;
  border-radius: 12px;
  z-index: 5;
}

.nameDiv {
  position: relative; 
}

.name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 5px;
}

</style>
