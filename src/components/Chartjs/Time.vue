<template>
  <canvas id="Graph" width="100%" :height="isDesktop ? '30px' : '50px'"></canvas>
</template>

<script>

import Chartjs from 'chart.js/dist/Chart.js'
import 'chartjs-plugin-datalabels'

import utils from '@/utils'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['data'],
  data() {
    return {
      graph: null,
    }
  },
  mounted() {
    this.graph = new Chartjs(this.$el, {
      type: 'line',
      data: {
        datasets: [{
          data: this.data,
          borderColor: 'rgba(89, 160, 222, .2)',
          pointBackgroundColor: val => this.getColor(val.dataset.data[val.dataIndex]),
          hoverBackgroundColor: 'white',
          backgroundColor: this.gradient,
        }],
        labels: this.getTimeLabels,
      },
      options: {
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
            formatter: v => v === '0.0' || v === 0 ? '' : v,
            clamp: true,
            color: '#fff',
            align: 'top',
            anchor: 'end',
            offset: 10,
          },
        },
      },
    })
  },
  methods: {
    colorToColor(arr1, arr2, offset) {
      const trans = (oldNum, newNum) => utils.transitionColor(oldNum, newNum, offset, 60)
      return `rgba(${trans(arr1[0], arr2[0])},${trans(arr1[1], arr2[1])},${trans(arr1[2], arr2[2])}, 1)`
    },
    getColor(offset) {
      const red = [222, 89, 89]
      const yellow = [255, 227, 102]
      const green = [89, 222, 93]
      const blue = [89, 160, 222]

      const get = (arr1, arr2) => this.colorToColor(arr1, arr2, offset)
      
      if (offset <= 15) return get(red, red)
      if (offset <= 30) return get(red, yellow)
      if (offset <= 45) return get(yellow, green)
      if (offset <= 60) return get(green, blue)
    },
  },
  computed: {
    ...mapState(['userInfo']),
    ...mapGetters(['isDesktop']),
    gradient() {
      const gradient = this.$el.getContext('2d').createLinearGradient(0, 0, 0, 400)

      gradient.addColorStop(0, 'rgba(89, 160, 222, .2)')
      gradient.addColorStop(0.5, 'rgba(89, 160, 222, 0.1)')
      gradient.addColorStop(1, 'rgba(89, 160, 222, 0)')

      return gradient
    },
    getTimeLabels() {
      return !this.userInfo.disablePmFormat ? [
        '1am', '2am', '3am', '4am', '5am', '6am',
        '7am', '8am', '9am', '10am', '11am', '12am',
        '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
        '7pm', '8pm', '9pm', '10pm', '11pm', '12pm',
      ] : [
        '0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h',
        '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h',
        '18h', '19h', '20h', '21h', '22h', '23h',
      ]
    },
  },
  watch: {
    data() {
      this.graph.data.datasets = [{
          data: this.data,
          borderColor: 'rgba(89, 160, 222, .2)',
          pointBackgroundColor: val => this.getColor(val.dataset.data[val.dataIndex]),
          hoverBackgroundColor: 'white',
          backgroundColor: this.gradient,
        }],
      this.graph.update()
    },
  },
}

</script>

<style scoped>

</style>
