<template>
  <div class='loading-component'>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
      <g>
        <path class='gray' :class='theme' d="M100,87.428C100,94.001,94.092,99,87.647,99H11.797C5.352,99,0,94.001,0,87.428v-73.4   C0,7.454,5.352,2,11.797,2h75.851C94.092,2,100,7.454,100,14.028V87.428z"/>
        <g>
          <path class='card' :class='theme' d="M35.416,93.731c-0.167-7.107,2.445-13.771,7.353-18.915c10.133-10.616,27.013-10.972,37.63-0.84    c3.17,3.026,8.193,2.928,11.219-0.242c3.026-3.17,2.908-8.183-0.263-11.209c-8.21-7.835-18.983-11.995-30.325-11.732    c-11.345,0.265-21.908,4.936-29.743,13.146c-7.835,8.21-12.003,18.816-11.738,30.161c0.04,1.709,0.192,3.533,0.429,4.899    c5.699,0,10.499,0,16.124,0C35.694,97.634,35.459,95.583,35.416,93.731z"/>
        </g>
        <g>
          <path class='card' :class='theme' d="M24.194,60.765c-2.301,0-4.582-0.995-6.151-2.917c-2.772-3.394-2.268-8.393,1.127-11.165l7.439-6.075    c3.395-2.772,8.394-2.268,11.165,1.127c2.772,3.394,2.268,8.393-1.127,11.165l-7.439,6.075    C27.735,60.179,25.959,60.765,24.194,60.765z"/>
        </g>
      </g>
    </svg>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class LoadingComponent extends Vue {
  @State theme! :string
}

</script>

<style scoped>

.loading-component {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes dark {
  0% {
    fill: #191919;
  }
  50% {
    fill: #fc7d7d;
  }
  100% {
    fill: #191919;
  }
}

.gray.dark {
  fill: #191919;
  animation: dark;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

.card.dark {
  fill: #242424;
}

@keyframes light {
  0% {
    fill: #F0F0F0;
  }
  50% {
    fill: #fc7d7d;
  }
  100% {
    fill: #F0F0F0;
  }
}

.gray.light {
  fill: #F0F0F0;
  animation: light;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

.card.light {
  fill: #F8F7F6;
}

</style>
