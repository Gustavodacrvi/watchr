<template>
  <i class='icon' :class='[`fa fa-${ico} ${sz} icon ` + $store.state.theme.style, blinking ? "blink" : ""]' @click='$emit("click");activateBlink()' @mouseover='$emit("mouseover")' @mouseleave='$emit("mouseleave")' @dblclick='$emit("dblclick")'></i>  
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    sz: String,
    ico: String,
    blink: Boolean,
  },
  data() {
    return {
      blinking: false,
    };
  },
  methods: {
    activateBlink() {
      if (this.blink) {
        this.blinking = true;
        setTimeout(() => {
          this.blinking = false;
        }, 100);
      }
    },
  },
});
</script>

<style scoped>

.medium {
  font-size: 18px;
}

.medium-medium {
  font-size: 20px;
}

.big {
  font-size: 24px;
}

.big-big {
  font-size: 26px;
}

.big-big-big {
  font-size: 34px;
}

.massive {
  font-size: 100px;
}

.pointer {
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
  -webkit-tap-highlight-color: transparent;
}

.icon {
  transition-duration: .2s;
  color: #ADADAD;
}

.icon:hover {
  text-shadow: 0 0 3px #ADADAD;
}

.color {
  color: #A97CFC;
}

.color-red {
  color: #FC7C85;
}

.color-red:hover {
  text-shadow: 0 0 2px #FC7C85;
}

.color-green {
  color: #89FC7C;
}

.color-green:hover {
  text-shadow: 0 0 2px #89FC7C;
}

.blink {
  transition-duration: .1s;
  color: #A97CFC !important;
  text-shadow: none !important;
  transform: scale(1.1,1.1);
}

.icon-main-color {
  color: #A97CFC;
}

.icon-color-hover:hover {
  color: #A97CFC;
  text-shadow: 0 0 2px #A97CFC;
}

</style>
