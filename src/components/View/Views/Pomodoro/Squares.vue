<template>
  <div class="Squares">
    <div v-for="i in 4" :key="i"
      class="square"
    >
      <svg class="svg" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    width="24.563px" height="24.5px" viewBox="0 0 10.563 10.5" enable-background="new 0 0 10.563 10.5" xml:space="preserve">
      <polyline class="trans" fill="none" :stroke="i < (cycles + 1) ? 'var(--dark-red)' : 'var(--light-gray)'" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="
        2.407,4.815 4.323,7.028 8.156,3.472 "/>
      <g>
        <path class="trans" fill="none" :stroke="i < (cycles + 1) ? 'var(--txt)' : 'var(--light-gray)'" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2.0214,2.0214" d="M10.063,9
          c0,0.552-0.448,1-1,1H1.5c-0.552,0-1-0.448-1-1V1.5c0-0.552,0.448-1,1-1h7.563c0.552,0,1,0.448,1,1V9z"/>
      </g>
      </svg>
    </div>
    <VolumeSlider/>
    <span v-show="longCycles > 0" class="long-msg">+{{ longCycles }}</span>
  </div>
</template>

<script>

import VolumeSlider from './VolumeSlider.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    VolumeSlider,
  },
  computed: {
    ...mapGetters({
      longCycles: 'pomo/longCycles',
      cycles: 'pomo/cyclePomos',
    })
  },
}

</script>

<style scoped>

.Squares {
  margin-top: 14px;
  margin-left: 8px;
}

.mobile .Squares {
  margin-top: 0;
}

.square {
  display: inline-block;
  margin-right: 9px;
}

.tiny {
  margin: 0;
}

.trans {
  transition-duration: .3s;
}

.long-msg {
  position: relative;
  bottom: 5px;
  color: var(--dark-red);
  font-size: 1.5em;
}

.tiny .long-msg {
  font-size: 1.1em;
  bottom: 3px;
}

.tiny .svg {
  width: 18px !important;
  height: 18px !important;
}

</style>
