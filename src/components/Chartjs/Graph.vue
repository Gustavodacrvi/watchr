<template>
  <canvas id="Graph" width="100%" height="30px"></canvas>
</template>

<script>

import Chartjs from 'chart.js'
import 'chartjs-plugin-datalabels'

export default {
  data() {
    return {
      graph: null,
    }
  },
  mounted() {
    const chart = this.$el

    const gradient = chart.getContext('2d').createLinearGradient(0, 0, 0, 400)

    gradient.addColorStop(0, 'rgba(89, 160, 222, .2)')
    gradient.addColorStop(0.5, 'rgba(89, 160, 222, 0.1)')
    gradient.addColorStop(1, 'rgba(89, 160, 222, 0)')

    
    this.graph = new Chartjs(chart, {
      type: 'line',
      data: {
        datasets: [{
          data: [10, 20, 30, 40, 70, 45, 47],
          borderColor: '#57A0DE',
          pointBackgroundColor: '#57A0DE',
          backgroundColor: gradient,
        }],
        labels: ['28', '29', '30', '31', '1', '2', '3']
      },
      options: {
          layout: {
          padding: {
            top: 45,
            left: 0,
            right: 0,
            bottom: 0,
          },
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "white",
            },
            gridLines: {
              display: false,
            },
          }],
          yAxes: [{
            ticks: {
              display: false,
            },
            gridLines: {
              display: false,
            },
          }]
        },
        plugins: {
          datalabels: {
            color: '#57A0DE',
            align: 'top',
            formatter: Math.round,
            font: {
              weight: 'bold',
            },
          },
        },
      },
    })
  },
}

</script>
