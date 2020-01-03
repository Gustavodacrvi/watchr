<template>
  <canvas id="Graph" width="100%" :height="isDesktop ? '30px' : '40px'"></canvas>
</template>

<script>

import Chartjs from 'chart.js'
import 'chartjs-plugin-datalabels'

import { mapGetters } from 'vuex'

export default {
  props: ['data', 'labels'],
  data() {
    return {
      graph: null,
    }
  },
  mounted() {
    this.mount()
  },
  methods: {
    mount() {
      this.graph = new Chartjs(this.$el, {
        type: 'line',
        data: {
          datasets: [{
            data: this.data,
            borderColor: '#57A0DE',
            pointBackgroundColor: '#57A0DE',
            backgroundColor: this.gradient,
          }],
          labels: this.labels,
        },
        options: {
          elements: {
            line: {
              tension: 0,
            },
          },
          layout: {
            padding: {
              top: 45,
              left: 10,
              right: 10,
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
              formatter: v => v,
              color: '#57A0DE',
              align: 'top',
              font: {
                weight: 'bold',
              },
            },
          },
        },
      })
    },
  },
  computed: {
    ...mapGetters(['isDesktop']),
    gradient() {
      const gradient = this.$el.getContext('2d').createLinearGradient(0, 0, 0, 400)

      gradient.addColorStop(0, 'rgba(89, 160, 222, .2)')
      gradient.addColorStop(0.5, 'rgba(89, 160, 222, 0.1)')
      gradient.addColorStop(1, 'rgba(89, 160, 222, 0)')

      return gradient
    },
  },
  watch: {
    data() {
      this.graph.data.datasets = [{
          data: this.data,
          borderColor: '#57A0DE',
          pointBackgroundColor: '#57A0DE',
          backgroundColor: this.gradient,
        }]
      this.graph.update()
    },
    labels() {
      this.graph.data.labels = this.labels
      this.graph.update()
    },
  },
}

</script>
