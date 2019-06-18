<template>
  <div class='wrapper'>
    <div class='relative'>
      <transition name='fade' @after-leave='closeAlert'>
        <div class='alert' v-if='showing'>{{ alert.name }}</div>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import { Alert } from '@/interfaces/alert'

@Component
export default class LabelAdder extends Vue {
  @State('alerts') public readonly alerts!: Alert[]
  @Mutation('moveAlertQueue') public readonly moveAlertQueue!: () => void

  public showing: boolean = false
  public alert: Alert | null = null

  public showLastAlert(): void {
    if (this.alerts.length !== 0 && !this.showing) {
      this.alert = this.alerts.shift() as Alert
      this.moveAlertQueue()
      this.showing = true
      setTimeout(() => {
        this.showing = false
      }, this.alert.duration * 1000)
    }
  }

  public closeAlert(): void {
    this.showing = false
    this.showLastAlert()
  }

  @Watch('alerts')
  public onAlertsChange(alerts: Alert[]): void {
    this.showLastAlert()
  }
}

</script>

<style scoped>

.wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
}

.relative {
  position: relative;
  width: 100%;
  height: 100%;
}

.alert {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  background-color: purple;
}

</style>
