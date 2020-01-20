<template>
  <transition-group
    class="root"
    name="trans"
    mode="out-in"
    tag="span"
  >
    <Icon v-if="!co && !se && !so" class="tra-icon cursor remove-highlight" key="1"
      icon="box"
      :color='color'
      width="20px"
    />
    <Icon v-else-if="co && !se && !so" class="tra-icon cursor remove-highlight" key="2"
      icon="box-check-filled"
      :color='color'
      width="20px"
    />
    <Icon v-else-if="!co && se && !so" class="tra-icon cursor remove-highlight" key="3"
      icon="circle"
      :color='color'
      width="20px"
    />
    <Icon v-else-if="!co && se && so" class="tra-icon cursor remove-highlight" key="3"
      icon="circle-dash"
      :color='color'
      width="20px"
    />
    <Icon v-else-if="co && !se && !so" class="tra-icon cursor remove-highlight" key="4"
      icon="box-check"
      :color='color'
      width="20px"
    />
    <Icon v-else-if="co && se && !so" class="tra-icon cursor remove-highlight" key="5"
      icon="circle-check"
      :color='color'
      width="20px"
    />
    <Icon v-else-if="co && se && so" class="tra-icon cursor remove-highlight" key="5"
      icon="circle-check-dash"
      :color='color'
      width="20px"
    />
  </transition-group>
</template>

<script>

import Icon from "@/components/Icon.vue"

export default {
  props: ['co', 'so', 'se', 'color'],
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
