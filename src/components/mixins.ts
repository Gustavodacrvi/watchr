import Vue from 'vue';

export const app = Vue.extend({
  methods: {
    parseMinutesToPixels(minutes: number): number {
      return ((minutes * 39) / 20);
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
      str += '' + Math.floor(pixels / 117);
      str += '-' + Math.floor(((pixels % 117) * 20) / 39);
      return str;
    },
  },
});
