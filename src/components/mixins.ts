export const app = {
  computed: {
    parseMinutesToPixels(minutes: number): number {
      return ((minutes * 5) / 3) + 3;
    },
    parseTimeToMinutes(time: string): number {
      const arr = time.split('-');
      return (parseInt(arr[0], 10) * 60) + parseInt(arr[1], 10);
    },
    parseTimeToPixels(time: string): string {
      return this.parseMinutesToPixels(this.parseTimeToMinutes(time)) + 'px';
    },
  },
};
