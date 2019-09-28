<template>
  <div class="ActButton handle">
    <div class="floating">
      <div class="button cb">
        <Icon class="icon"
          :icon="icon"
          :color="color"
        />
        <div class="path"></div>
      </div>
    </div>
    <div class="renderer">
      {{ txt }}
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

export default {
  props: ['icon', 'color' ,'txt'],
  components: {
    Icon: IconVue,
  },
}

</script>

<style scoped>

.ActButton, .button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.floating {
  position: relative;
  transform: scale(1,1);
  transition-duration: .3s;
}

.floating:hover {
  transform: scale(1.1,1.1);
}

.button {
  transition-duration: .3s;
  width: 45px;
  height: 45px;
  z-index: 10;
  overflow: hidden;
  cursor: pointer;
  border-radius: 100px;
}


.path {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 100%;
  clip-path: circle(0px);
  z-index: 10;
  transition-duration: .3s;
  background-color: var(--light-gray);
}

.button:hover .path {
  clip-path: circle(50px);
}

.button:active .path {
  background-color: var(--primary);
}

.icon {
  position: relative;
  transform: translateY(2px);
  z-index: 11;
}

</style>
