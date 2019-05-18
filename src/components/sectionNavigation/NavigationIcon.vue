<template>
  <div class='navigation-icon' :class='{mobile: !desktop, desktop: desktop}'>
    <icon @mouseover='showing = true' @mouseleave='showing = false' class='pointer icon-color-hover' :class='{"section-icon-active": isActive}' sz='big' :ico='ico' @click='navigate'></icon>
    <transition name='fade-transition'>
      <span v-show='showing && desktop' class='txt'>{{ txt }}</span>
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
    ico: String,
    txt: String,
    desktop: Boolean,
  },
  data() {
    return {
      showing: false,
    };
  },
  methods: {
    navigate() {
      this.$store.commit('app/pushSection', this.txt.toLowerCase());
    },
  },
  computed: {
    isActive(): boolean {
      return (this.$store.state.app.section === this.txt.toLowerCase());
    },
  },
});
</script>

<style scoped>

.navigation-icon {
  position: relative;
  text-align: center;
}

.desktop {
  line-height: 40px;
}

.mobile {
  flex-basis: 100%;
}

.txt {
  position: absolute;
  top: 42%;
  transform: translateY(-50%);
  left: 80%;
  color: #A97CFC;
  font-size: 22px;
}

.section-icon-active {
  color: #A97CFC;
}

</style>
