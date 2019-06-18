<template>
  <div class='wrapper'>
    <div class='relative'>
      <transition name='alert-trans' @after-leave='closeAlert'>
        <div v-if='showing' class='alert card round-border' :class='[theme, alert.type]'>
          <span class='txt'>{{ alert.name }}</span>
        </div>
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
  @State('theme') public readonly theme!: Alert[]
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
  pointer-events: none;
}

.relative {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.alert {
  pointer-events: all;
  margin-bottom: 25px;
  padding: 16px;
  box-sizing: border-box;
  max-width: 320px;
  display: flex;
  align-items: center;
  height: 55px;
  z-index: 100;
}

.alert.error {
  border: 1px solid #FF6B66;
}

.alert.success {
  border: 1px solid #70FF66;
}

.alert.warning {
  border: 1px solid #FFE366;
}

.alert-trans-enter-active, .alert-trans-leave-active {
  transition: margin-bottom .3s !important;
} 

.alert-trans-enter, .alert-trans-leave-to {
  margin-bottom: -55px;
}

.alert-trans-enter-to, .alert-trans-leave {
  margin-bottom: 25px;
}

</style>
