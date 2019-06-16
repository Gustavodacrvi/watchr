<template>
  <div>
    <app :localStorage='true'></app>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

import App from '@/components/App.vue'

@Component({
  components: {
    app: App,
  },
})
export default class Guest extends Vue {}

</script>
