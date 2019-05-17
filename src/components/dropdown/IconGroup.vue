<template>
  <span class='icon-group' @mouseenter='showing = true' @mouseleave='showing = false'>
    <icon class='icon-color-hover pointer' sz='big-big' :ico='handle'></icon>
    <transition name='fade-transition'>
      <div v-show='showing' class='content card-round' :class='$store.state.theme.style'>
        <template v-for='el in options'>
          <icon v-if='el.dblclick' :class='`color-${el.color}`' class='icon-group-icon pointer' :key='el.ico' :ico='el.ico' sz='big-big' :title='el.title' :blink='true' @dblclick='el.callback'></icon>
          <icon v-else :title='el.title' :class='`color-${el.color}`' class='icon-group-icon pointer' :key='el.ico' :ico='el.ico' sz='big-big' @click='el.callback'></icon>
        </template>
      </div>
    </transition>
  </span>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  props: {
    handle: String,
    options: Array,
  },
  data() {
    return {
      showing: false,
    };
  },
});
</script>

<style scoped>

.icon-group {
  position: relative;
}

.content {
  display: flex;
  position: absolute;
  bottom: 160%;
  right: 0;
  z-index: 1;
}

.icon-group-icon {
  margin: 6px;
}

</style>
