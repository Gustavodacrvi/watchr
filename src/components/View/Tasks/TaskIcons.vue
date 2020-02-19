<template functional>
  <transition-group
    class="root"
    name="trans"
    mode="out-in"
    tag="span"
  >
    <Icon v-if="!props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="1"
      icon="box"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="props.ca && !props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="2"
      icon="box-close"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="3"
      icon="box-check-filled"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="!props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="4"
      icon="box-dash"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="props.co && !props.se && props.so" class="tra-icon cursor remove-highlight" key="5"
      icon="box-check-dash"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="!props.co && props.se && !props.so" class="tra-icon cursor remove-highlight" key="6"
      icon="circle"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="!props.co && props.se && props.so" class="tra-icon cursor remove-highlight" key="7"
      icon="circle-dash"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="props.co && !props.se && !props.so" class="tra-icon cursor remove-highlight" key="8"
      icon="box-check"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="props.co && props.se && !props.so" class="tra-icon cursor remove-highlight" key="9"
      icon="circle-check"
      :color='props.color'
      width="20px"
    />
    <Icon v-else-if="props.co && props.se && props.so" class="tra-icon cursor remove-highlight" key="10"
      icon="circle-check-dash"
      :color='props.color'
      width="20px"
    />
  </transition-group>
</template>

<script>

export default {
  props: ['co', 'so', 'ca', 'se', 'color'],
}

</script>

<style scoped>

.root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding-top: 3px;
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
