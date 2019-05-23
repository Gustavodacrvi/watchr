<template>
  <transition name='fade-transition' mode='in-out'>
    <div class='adder' v-if='!active'>
      <icon ico='plus' sz='medium'></icon>
      <span class='msg'>{{ msg }}</span>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  props: {
    msg: String,
  },
  components: {
    'icon': Icon,
  },
  data() {
    return {
      active: false,
    };
  },
});
</script>

<style scoped>

.adder {
  margin: 16px 0;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.icon {
  color: #A97CFC;
}

.msg {
  color: #A97CFC;
  margin-left: 10px
}

</style>

