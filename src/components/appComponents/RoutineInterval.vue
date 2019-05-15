<template>
  <div class='interval' :style='styles'>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    color: String,
    start: String,
    end: String,
  },
  computed: {
    styles(): object {
      return [
        `background-color: ${this.color}`,
        `width: ${this.getWidth}px`,
      ];
    },
    getWidth(): number {
      let numbers: Array<number> = [];

      let arr = this.start.split('-');
      numbers.push(parseInt(arr[0]));
      numbers.push(parseInt(arr[1]));
      arr = this.end.split('-');
      numbers.push(parseInt(arr[0]));
      numbers.push(parseInt(arr[1]));
      
      let minutes = (numbers[2] * 60 + numbers[3]) - (numbers[0] * 60 + numbers[1]);
      
      return ((minutes * 5) / 3);
    },
  },
});
</script>

<style scoped>

.interval {
  position: absolute;
  height: 100%;
  border-radius: 12px;
}

</style>
