<template>
  <div id='hamburger-icon' :class='{"active-hamburger": active}' @click='toggleMobileSection'>
    <span class='line'></span>
    <span class='line'></span>
    <span class='line'></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      active: false,
      mobileSectionOpened: this.$store.state.mobileSectionOpened,
    };
  },
  methods: {
    toggleMobileSection() {
      if (this.active) {
        this.$store.commit('hideMobileSection');
      } else {
        this.$store.commit('showMobileSection');
      }
      this.active = !this.active;
    },
  },
  computed: {
    mobileSectionState(): boolean {
      return this.$store.state.mobileSectionOpened;
    },
  },
  watch: {
    mobileSectionState(newState) {
      this.active = newState;
    },
  },
});
</script>


<style scoped>

#hamburger-icon {
  position: relative;
  right: 0;
  display: inline-block;
  width: 32px !important;
  height: 28px !important;
  cursor: pointer;
  transition-duration: .2s;
}

.line {
  position: absolute;
  height: 5px;
  border-radius: 1.5px;
  background-color: #ADADAD;
  transition-duration: .2s;
}

#hamburger-icon:hover .line {
  background-color: #FE815E !important;
}

#hamburger-icon > :nth-child(1) {
  top: 0;
  width: 100%;
  left: 0;
}

#hamburger-icon > :nth-child(3) {
  bottom: 0;
  width: 100%;
  left: 0;
}

#hamburger-icon > :nth-child(2) {
  width: 22px;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.active-hamburger > :nth-child(2) {
  width: 0;
}

.active-hamburger > :nth-child(1) {
  top: 42% !important;
  left: -3px !important;
  width: 32px !important;
  transform: rotate(50deg);
}

.active-hamburger > :nth-child(3) {
  bottom: 40% !important;
  left: -3px !important;
  width: 32px !important;
  transform: rotate(-50deg);
}

.active-hamburger > :nth-child(2) {
  width: 0 !important;
  left: 50% !important;
}

.active-hamburger {
  right: -150px !important;
}

</style>

