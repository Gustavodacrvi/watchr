
<template>
  <div class="SmartViewsSelector">
    <div class="card-wrapper scroll-thin-horizontal">
      <div v-for="v in sidebarElements"
        class="smart-card card"
        :key="v.name"
        :class="{active: v.name === activeView}"
        @click="active = v.name"
      >
        <Icon
          :icon='v.icon'
          :color='v.iconColor'
          width='42px'
        />
      </div>
    </div>
    <div class="descr">
      <h3 class="active-name">{{ activeSmartView.name }}</h3>
      <p>
        <span v-html="activeSmartView.descr"></span>
      </p>
    </div>
  </div>  
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      active: null,
    }
  },
  computed: {
    ...mapGetters(['sidebarElements']),
    activeView() {
      return this.active || this.sidebarElements[0].name
    },
    activeSmartView() {
      return this.sidebarElements.find(el => el.name === this.activeView)
    }
  },
}

</script>

<style scoped>

.SmartViewsSelector {
  margin: 30px 0;
}

.card-wrapper {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: visible;
  padding: 18px 0;
}

.descr {
  margin-top: 36px;
}

.active-name {
  margin-bottom: 36px;
  font-size: 1.6em;
}

.smart-card {
  flex-basis: 110px;
  height: 110px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  margin-left: 16px;
  box-shadow: 0 0 14px var(--dark-void);
  transform: scale(1,1) translateY(0);
  transition-duration: .2s;
}

.active, .smart-card:hover {
  background-color: var(--light-gray);
}

.smart-card:hover {
  transform: scale(1.01,1.01) translateY(-4px);
}


.smart-card:active {
  transform: scale(.98,.98) translateY(2px);
}

</style>
