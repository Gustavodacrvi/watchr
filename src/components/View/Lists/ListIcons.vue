<template functional>
  <transition-group
    class="root"
    name="trans"
    mode="out-in"
    tag="span"
  >
    <Icon v-if="!props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="1"
      icon="pie"
      width="16px"
      :progress='props.progress'
    />
    <Icon v-else-if="props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="2"
      icon="circle-close"
      width="22px"
    />
    <Icon v-else-if="props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="3"
      icon="circle-check-filled"
      width="22px"
    />
    <Icon v-else-if="!props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="4"
      icon="circle-dash"
      width="22px"
    />
    <Icon v-else-if="props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="5"
      icon="circle-check-dash"
      width="22px"
    />
    <Icon v-else-if="!props.co && props.se && !props.so" class="tra-icon cursor remove-highlight" key="6"
      icon="circle"
      width="22px"
    />
    <Icon v-else-if="!props.co && props.se && props.so" class="tra-icon cursor remove-highlight" key="7"
      icon="circle-dash"
      width="22px"
    />
    <Icon v-else-if="props.co && props.se && !props.so" class="tra-icon cursor remove-highlight" key="9"
      icon="circle-check"
      width="22px"
    />
    <Icon v-else-if="props.co && props.se && props.so" class="tra-icon cursor remove-highlight" key="10"
      icon="circle-check-dash"
      width="22px"
    />
  </transition-group>
</template>

<script>

export default {
  props: ['co', 'so', 'ca', 'se', 'progress'],
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
