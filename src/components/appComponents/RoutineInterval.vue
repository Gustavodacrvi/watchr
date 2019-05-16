<template>
  <div :ref='id' class='interval' :class='{selected: isSelected}' :style='styles' @click='$emit("select", {id: id, position: getPosition})' @dblclick='showIcons = !showIcons'>
    <div class='nameDiv'>
      <span class='name' v-if='!dontShowName && !showIcons'>{{ id }}</span>
      <span v-show='showIcons' class='interval-time time-right'>{{ getEnd }}</span>
      <span v-show='showIcons' class='interval-time time-left'>{{ getStart }}</span>
      <icon v-show='showIcons' class='pointer color left routine-icon-left' sz='big-big-big' ico='arrows-alt-h'></icon>
      <icon v-show='showIcons' ref='routine-icon-right' draggable='true' class='pointer color right routine-icon-right' sz='big-big-big' ico='arrows-alt-h'></icon>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { app } from '@/components/mixins';
import Icon from '@/components/generalComponents/Icon.vue';
import mixins from 'vue-typed-mixins';

export default mixins(app).extend({
  mixins: [app as any],
  components: {
    icon: Icon,
  },
  props: {
    color: String,
    start: String,
    end: String,
    id: String,
  },
  data() {
    return {
      showIcons: false,
      left: undefined as any,
      width: undefined as any,
    };
  },
  created() {
    this.width = this.getWidth;
    // this error doesn't make sense, simply ignore it
    this.left = this.parseTimeToPixels(this.start);
  },
  mounted() {
    const ref: any = this.$refs[this.id];
    ref.style.left = this.left + 'px';

    const right: any = document.getElementsByClassName('routine-icon-right')[0];
    right.addEventListener('touchmove', this.resizeRightMobile);
    right.addEventListener('drag', this.resizeRightDesktop);
    right.addEventListener('touchend', this.resizeRightEvent);
    right.addEventListener('dragend', this.resizeRightEvent);
  },
  methods: {
    resizeRightEvent() {
      this.$emit('resizeright', this.width);
    },
    resizeRightDesktop(event: any) {
      event.preventDefault();
      const div: any = this.$refs[this.id];

      const windowOffset = div.getBoundingClientRect().left;
      const value: number = event.screenX - windowOffset;
      const leftWidth = value + Math.abs(div.offsetLeft);
      if (value > this.parseTimeToPixels('00-15') && event.screenX !== 0 && leftWidth < 2809) {
        this.width = value;
        this.$emit('select', {id: this.id, position: this.getPosition});
      }
    },
    resizeRightMobile(event: any) {
      event.preventDefault();
      const div: any = this.$refs[this.id];

      const windowOffset = div.getBoundingClientRect().left;
      const value: number = event.touches[0].screenX - windowOffset;
      if (value > this.parseTimeToPixels('00-15') && value + windowOffset < 1404 && event.screenX !== 0) {
        this.width = value;
        this.$emit('select', {id: this.id, position: this.getPosition});
      }
    },
  },
  computed: {
    styles(): object {
      return {
        backgroundColor: this.color,
        boxShadow: `0 1px 3px ${this.color}`,
        width: this.width + 'px',
      };
    },
    getEnd(): string {
      return this.parsePixelsToTime(this.width + this.left);
    },
    getStart(): string {
      return this.parsePixelsToTime(this.left);
    },
    isSelected(): boolean {
      return this.id === this.$store.state.app.interval;
    },
    getPosition(): number {
      return this.left + (this.width / 2);
    },
    getWidth(): number {
      const minutes = this.parseTimeToMinutes(this.end) - this.parseTimeToMinutes(this.start);
      return this.parseMinutesToPixels(minutes);
    },
    dontShowName(): boolean {
      return this.width < 101 && this.isSelected;
    },
  },
  destroyed() {
    const right: any = document.getElementsByClassName('routine-icon-right')[0];
    right.removeEventListener('touchmove', this.resizeRightMobile);
    right.removeEventListener('touchend', this.resizeRightEvent);
    right.removeEventListener('dragend', this.resizeRightEvent);
    right.removeEventListener('drag', this.resizeRightDesktop);
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
  touch-action: manipulation;
}

.nameDiv {
  position: relative;
  height: 100%;
}

.name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 17px;
}

.icon {
  position: absolute;
  top: -10px;
}

.left {
  left: -15px;
}

.right {
  right: -15px;
}

.interval-time {
  position: absolute;
  top: -25px;
}

.time-right {
  right: -40px;
}

.time-left {
  left: -40px;
}

</style>
