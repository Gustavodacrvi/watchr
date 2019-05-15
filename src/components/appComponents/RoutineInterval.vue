<template>
  <div :ref='id' class='interval' :class='{selected: isSelected}' :style='styles' @click='$emit("select", {id: id, position: getPosition})'>
    <div class='nameDiv'>
      <span class='name'>{{ id }}</span>
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
    id: String,
  },
  data() {
    return {
      left: undefined as any,
      width: undefined as any,
    };
  },
  created() {
    this.width = this.getWidth;
    this.left = app.computed.parseTimeToPixels(this.start);
  },
  mounted() {
    const ref: any = this.$refs[this.id];
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
    isSelected(): boolean {
      return this.id === this.$store.state.app.interval;
    },
    getPosition(): number {
      return this.left + (this.width / 2);
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
  cursor: pointer;
  transition: border .2s;
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

.selected {
  border: 2px solid #A97CFC;
}

</style>
