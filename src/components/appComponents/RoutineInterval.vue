<template>
  <div :ref='name' class='interval' v-bind:style='styles'>
    <div class='nameDiv'>
      <span class='name'>{{ name }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
    this.width = this.getWidth();
    this.left = this.getDistance();
  },
  mounted() {
    this.$refs[this.name].style.left = this.left + 'px';
  },
  methods: {
    getDistance(): number {
      const arr = this.start.split('-');
      let minutes = parseInt(arr[0]) * 60 + parseInt(arr[1]);
      return ((minutes * 5) / 3);
    },
    getWidth(): number {
      const numbers: Array<number> = [];

      let arr = this.start.split('-');
      numbers.push(parseInt(arr[0]));
      numbers.push(parseInt(arr[1]));
      arr = this.end.split('-');
      numbers.push(parseInt(arr[0]));
      numbers.push(parseInt(arr[1]));
      
      const minutes = (numbers[2] * 60 + numbers[3]) - (numbers[0] * 60 + numbers[1]);
      
      return ((minutes * 5) / 3);
    },
  },
  computed: {
    styles(): object {
      return {
        backgroundColor: this.color,
        boxShadow: `0 1px 3px ${this.color}`,
        width: this.width + 'px',
      }
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
