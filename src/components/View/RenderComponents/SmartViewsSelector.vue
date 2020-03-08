
<template>
  <div class="SmartViewsSelector">
    <div class="card-wrapper scroll-thin-horizontal">
      <div v-for="v in sidebarElements"
        class="smart-card card"
        :key="v.name"
      >
        <Icon
          :icon='v.icon'
          :color='v.iconColor'
          width='42px'
        />
      </div>
    </div>
  </div>  
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['sidebarElements'])
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

.smart-card:hover {
  background-color: var(--light-gray);
  transform: scale(1.01,1.01) translateY(-4px);
}

.smart-card:active {
  transform: scale(.98,.98) translateY(2px);
}

</style>
