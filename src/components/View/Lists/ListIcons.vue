<template functional>
  <transition-group
    class="root"
    name="trans"
    mode="out-in"
    tag="span"
  >
    <Icon v-if="props.re && !props.se" class="tra-icon cursor remove-highlight" key="0"
      icon="repeat"
      :color='props.color'
      width="10px"
    />
    <Icon v-else-if="!props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="1"
      icon="pie"
      width="10px"
      :progress='props.progress'
    />
    <Icon v-else-if="props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="2"
      icon="circle-close"
    />
    <Icon v-else-if="props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="3"
      icon="circle-check-filled"
    />
    <Icon v-else-if="!props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="4"
      icon="circle-dash"
    />
    <Icon v-else-if="props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="5"
      icon="circle-check-dash"
    />
    <Icon v-else-if="!props.co && props.ac && props.se && !props.so" class="tra-icon cursor remove-highlight" key="6"
      icon="circle-filled"
      color='var(--primary)'
    />
    <Icon v-else-if="!props.co && !props.ac && props.se && !props.so" class="tra-icon cursor remove-highlight" key="68"
      icon="circle"
    />
    <Icon v-else-if="!props.co && props.se && props.so" class="tra-icon cursor remove-highlight" key="7"
      icon="circle-dash"
    />
    <Icon v-else-if="props.co && props.se && !props.so" class="tra-icon cursor remove-highlight" key="9"
      icon="circle-check"
    />
    <Icon v-else-if="props.co && props.se && props.so" class="tra-icon cursor remove-highlight" key="10"
      icon="circle-check-dash"
    />
  </transition-group>
</template>

<script>

export default {
  props: ['co', 'so', 'ca', 're', 'se', 'ac','progress'],
}

</script>

<style scoped>

.root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  padding-top: 1px;
  padding-left: 1.5px;
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
