<template>
  <transition-group
    class="root"
    name="trans"
    mode="out-in"
    tag="span"
  >
    <Icon v-if="!ca && !co && !so" class="tra-icon cursor remove-highlight" key="1"
      icon="pie"
      color='var(--fade)'
      width="15px"
      :progress='progress'
    />
    <Icon v-else-if="!ca && !co && so" class="tra-icon cursor remove-highlight" key="2"
      icon="pie-someday"
      color='var(--fade)'
      width="15px"
      :progress='progress'
    />
    <Icon v-else-if="!ca && co && so" class="tra-icon cursor remove-highlight" key="3"
      icon="circle-check-dash"
      color='var(--fade)'
      width="22px"
    />
    <Icon v-else-if="!ca && co && !so" class="tra-icon cursor remove-highlight" key="4"
      icon="circle-check"
      color='var(--fade)'
      width="22px"
    />
  </transition-group>
</template>

<script>

/*
  <Icon v-if="!completed" class="progress-icon cursor remove-highlight"
    :icon='progressIcon'
    width='15px'
    :progress='getListProgress'
    color='var(--fade)'
  />
  <Icon v-else class="progress-icon cursor remove-highlight"
    :icon='circleIcon'
    width='22px'
    color='var(--fade)'
  />
*/


import Icon from "@/components/Icon.vue"

export default {
  props: ['co', 'so', 'ca', 'progress'],
  components: {Icon},
}

</script>

<style scoped>

.root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tra-icon {
  position: absolute;
}

.trans-enter, .trans-leave-to {
  transition-duration: .2s;
  transform: scale(0,0);
}

.trans-leave, .trans-enter-to {
  transition-duration: .2s;
  transform: scale(1,1);
}

</style>
