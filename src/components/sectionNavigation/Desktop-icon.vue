<template>
  <div class='navigation-desktop-icon'>
    <icon @mouseover='showing = true' @mouseleave='showing = false' class='pointer icon-color-hover' sz='big-big' :ico='ico'></icon>
    <transition name='fade-transition'>
      <span v-show='showing' class='txt'>{{ txt }}</span>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from './../generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  props: {
    ico: String,
    txt: String,
  },
  data() {
    return {
      showing: false,
    };
  },
});
</script>

<style scoped>

.navigation-desktop-icon {
  position: relative;
  text-align: center;
  line-height: 40px;
}

.txt {
  position: absolute;
  top: 42%;
  transform: translateY(-50%);
  left: 80%;
  color: #FE684F;
  font-size: 22px;
}

</style>
