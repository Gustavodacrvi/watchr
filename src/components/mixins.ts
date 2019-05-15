import Vue from 'vue';

export const app = Vue.extend({
  methods: {
    parseMinutesToPixels(minutes: number): number {
      return ((minutes * 7) / 4) + 3;
    },
    parseTimeToMinutes(time: string): number {
      const arr = time.split('-');
      return (parseInt(arr[0], 10) * 60) + parseInt(arr[1], 10);
    },
    parseTimeToPixels(time: string): number {
      return this.parseMinutesToPixels(this.parseTimeToMinutes(time));
    },
    parsePixelsToTime(pixels: number): string {
      let str: string = '';
      str += '' + Math.floor(pixels / 105);
      str += '-' + Math.floor(((pixels % 105) * 4) / 7);
      return str;
    },
  },
});

// 2520 - 1440
// px   - min
// 2520min = 1440px
// min = 1440px/2520
// 2520min = 1440px
// px = 2520min/1440


// min = 144px/252
// min = 72px/126
// min = 12px/21
// min = 4px/7
