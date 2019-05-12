<template>
  <span class='icon-group' @mouseenter='showing = !showing' @mouseleave='showing = !showing'>
    <icon class='icon-color-hover pointer' sz='big-big' :ico='handle'></icon>
    <div v-if='showing' class='content card-round' :class='$store.state.theme.style'>
      <template v-for='el in options'>
        <icon :key='el.ico' :ico='el.ico' sz='big-big'></icon>
      </template>
    </div>
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
      showing: true,
    };
  },
});
</script>

<style scoped>

.icon-group {
  position: relative;
}

.content {
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1;
}

</style>
