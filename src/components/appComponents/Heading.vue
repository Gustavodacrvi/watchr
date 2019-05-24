<template>
  <div class='heading'>
    <div class='header'>
      <span class='left'>{{ title }}</span>
      <icon v-if='simple' :class='{right: simple, active: show}' class='pointer icon-color-hover' ico='angle-down' sz='tiny' @click='show = !show'></icon>
    </div>
    <transition name='fade-transition'>
      <div v-if='show' class='content'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  props: {
    showing: Boolean,
    simple: Boolean,
    title: String,
  },
  data() {
    return {
      show: this.showing,
    };
  },
});
</script>

<style scoped>

.heading {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.header {
  border-bottom: 1px solid #A97CFC;
  padding: 12px 6px;
}

.right {
  float: right;
  clear: right;
}

.active {
  transform: rotate(180deg);
}

.content {
  margin: 14px 6px;
}

</style>

