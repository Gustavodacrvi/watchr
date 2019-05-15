<template>
  <div :ref='id' class='interval' :class='{selected: isSelected}' :style='styles' @click='$emit("select", {id: id, position: getPosition})' @dblclick='showIcons = !showIcons'>
    <div class='nameDiv' v-if='!dontShowName'>
      <span class='name'>{{ id }}</span>
      <span v-show='showIcons' class='interval-time right'></span>
      <icon v-show='showIcons' class='pointer color left routine-icon-left' sz='big-big-big' ico='arrows-alt-h'></icon>
      <icon v-show='showIcons' ref='routine-icon-right' draggable='true' class='pointer color right routine-icon-right' sz='big-big-big' ico='arrows-alt-h'></icon>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { app } from '@/components/mixins';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
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
    this.left = app.computed.parseTimeToPixels(this.start);
  },
  mounted() {
    const ref: any = this.$refs[this.id];
    ref.style.left = this.left + 'px';

    const right: any = document.getElementsByClassName('routine-icon-right')[0];
    right.addEventListener('touchmove', this.resizeRightMobile);
    right.addEventListener('drag', this.resizeRightDesktop);
    right.addEventListener('touchend', (event: any) => {
      this.$emit('resizeright', this.width);
    });
    right.addEventListener('dragend', (event: any) => {
      this.$emit('resizeright', this.width);
    });
  },
  methods: {
    resizeRightDesktop(event: any) {
      event.preventDefault();
      const div: any = this.$refs[this.id];

      const windowOffset = div.getBoundingClientRect().left;
      if (event.screenX - windowOffset > app.computed.parseTimeToPixels('00-15')) {
        this.width = event.screenX - windowOffset;
      }
    },
    resizeRightMobile(event: any) {
      event.preventDefault();
      const div: any = this.$refs[this.id];

      const windowOffset = div.getBoundingClientRect().left;
      if (event.touches[0].screenX - windowOffset > app.computed.parseTimeToPixels('00-15')) {
        this.width = event.touches[0].screenX - windowOffset;
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
    dontShowName(): boolean {
      return this.width < 101 && !this.isSelected;
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

</style>
