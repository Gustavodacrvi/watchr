<template>
  <DotSlider class="VolumeSlider"
    v-model="value"
    width='125px'
  />
</template>

<script>

import DotSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'
import { mapState } from 'vuex'

export default {
  components: {
    DotSlider,
  },
  created() {
    this.value = this.saved * 100
  },
  data() {
    return {
      value: 50,
    }
  },
  computed: {
    ...mapState({
      saved: state => state.pomo.volume
    })
  },
  watch: {
    value() {
      this.$store.commit('pomo/saveVolume', this.value / 100)
    },
  }
}

</script>

<style scoped>

.VolumeSlider {
  position: relative;
  display: inline-block;
  transform: translateY(-3px);
  margin-left: 4px;
}

</style>

<style>

.vue-slider-rail {
  background-color: var(--light-gray) !important;
}

.vue-slider-process {
  background-color: var(--fade) !important;
}

.vue-slider-dot-handle {
  background-color: var(--primary) !important;
  border: none !important;
}

</style>
