<template functional>
  <transition-group
    class="root"
    name="trans"
    mode="out-in"
    tag="span"
  >
    <Icon v-if="props.co" class="tra-icon cursor remove-highlight" key="3"
      icon="box-check-filled"
      :color='props.color'
      width="10px"
      :box='true'
    />
    <Icon v-else-if="props.forceDefault || (!props.ca && !props.co && !props.se && !props.so)" class="tra-icon cursor remove-highlight" key="1"
      icon="box"
      :color='props.color'
      width="10px"
      :box='true'
    />
    <Icon v-else-if="props.re && !props.se" class="tra-icon cursor remove-highlight" key="0"
      icon="repeat"
      :color='props.color'
      width="12px"
      :box='true'
    />
    <Icon v-else-if="props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="2"
      icon="box-close"
      :color='props.color'
      width="10px"
      :box='true'
    />
    <Icon v-else-if="!props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="4"
      icon="box-dash"
      :color='props.color'
      width="10px"
      :box='true'
    />
    <Icon v-else-if="props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="5"
      icon="box-check-dash"
      :color='props.color'
      width="10px"
      :box='true'
    />
    <Icon v-else-if="!props.co && props.se && props.ac && !props.so" class="tra-icon cursor remove-highlight" key="6"
      icon="circle-filled"
      color='var(--txt)'
      width="12px"
      :box='true'
    />
    <Icon v-else-if="props.se && !props.ac && !props.so" class="tra-icon cursor remove-highlight" key="68"
      icon="circle"
      :color='props.color'
      width="12px"
      :box='true'
    />
    <Icon v-else-if="props.se && props.so" class="tra-icon cursor remove-highlight" key="7"
      icon="circle-dash"
      :color='props.color'
      width="10px"
      :box='true'
    />
    <Icon v-else-if="props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="8"
      icon="box-check"
      :color='props.color'
      width="10px"
    />
  </transition-group>
</template>

<script>

export default {
  props: ['co', 'forceDefault', 'so', 'ca', 're', 'ac', 'se', 'color'],
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
  transition-duration: .15s;
  transform: scale(0,0);
}

.trans-leave, .trans-enter-to {
  transition-duration: .15s;
  transform: scale(1,1);
}

</style>
