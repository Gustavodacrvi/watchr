<template>
  <div
    class="CommentCounter"
    :class="{number}"
  >
    <div
      class="wrapper"
      :class="{show: hover || number}"
    >
      <Icon
        icon='comment'
        width='26px'
      />
      <transition name="num-t">
        <span v-if="number" class="num">{{number}}</span>
      </transition>
    </div>
  </div>
</template>

<script>

import Icon from "@/components/Icon.vue"

export default {
  props: ['number', 'hover'],
  components: {
    Icon,
  },
}

</script>

<style scoped>

.CommentCounter {
  position: absolute;
  right: calc(100% + 4px);
  height: 100%;
  display: flex;
  color: var(--fade);
  align-items: center;
  transition: .2s right, .2s color, .15s transform;
  transform: scale(1,1);
}

.number {
  right: calc(100% + 23px);
  color: var(--txt) !important;
}

.CommentCounter:hover {
  transform: scale(1.1,1.1);
  cursor: pointer;
  color: var(--txt) !important;
}

.wrapper {
  position: relative;
  top: 4px;
  opacity: 0;
  transform: translateY(5px);
  transition-duration: .25s;
}

.num {
  position: absolute;
  left: 100%;
  bottom: 0;
}

.show {
  opacity: 1;
  transform: translateY(0px);
  transition-duration: .25s;
}

</style>
