<template>
  <canvas id="Graph" width="100%" height="30px"></canvas>
</template>

<script>

import Chartjs from 'chart.js'

export default {
  data() {
    return {
      graph: null,
    }
  },
  mounted() {
    this.graph = new Chartjs(this.$el, {
      type: 'line',
      options: {
        scales: {
          yAxes: {
            stacked: true,
          },
        },
      },
    })
  },
}

</script>
