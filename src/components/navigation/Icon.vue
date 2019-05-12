<template>
  <div id='hamburger-icon' :class='{"active-hamburger": active}' @click='toggleMobileSection'>
    <span class='line' id='hamburger-icon-top'></span>
    <span class='line' id='hamburger-icon-middle'></span>
    <span class='line' id='hamburger-icon-bottom'></span>
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
  transition: right .3s;
}

.line {
  position: absolute;
  height: 5px;
  border-radius: 1.5px;
  background-color: #ADADAD;
  transition-duration: .2s;
}

#hamburger-icon:hover .line {
  background-color: #A97CFC !important;
}

#hamburger-icon-top {
  top: 0;
  width: 100%;
  left: 0;
}

#hamburger-icon-bottom {
  bottom: 0;
  width: 100%;
  left: 0;
}

#hamburger-icon-middle {
  width: 22px;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.active-hamburger #hamburger-icon-middle {
  width: 0;
}

.active-hamburger #hamburger-icon-top {
  top: 42% !important;
  left: -3px !important;
  width: 32px !important;
  transform: rotate(50deg);
}

.active-hamburger #hamburger-icon-bottom {
  bottom: 40% !important;
  left: -3px !important;
  width: 32px !important;
  transform: rotate(-50deg);
}

.active-hamburger #hamburger-icon-middle {
  width: 0 !important;
  left: 50% !important;
}

.active-hamburger {
  right: -150px !important;
}

</style>

