<template>
  <div class="ActButton handle shadow" :class="platform">
    <div class="floating">
      <div class="button cb">
        <Icon class="icon"
          :icon="icon"
          :color="color"
        />
        <div class="path"></div>
      </div>
    </div>
    <div class="renderer task-renderer">
      {{ txt }}
    </div>
    <div class="renderer tags-act">
      {{ l["Add tag"] }}
    </div>
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['icon', 'color' ,'txt'],
  components: {
    Icon: IconVue,
  },
  computed: {
    ...mapGetters(['l', 'platform'])
  }
}

</script>

<style scoped>

.ActButton, .button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.renderer {
  width: 100%;
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
  width: 50px;
  height: 50px;
  z-index: 10;
  overflow: hidden;
  cursor: pointer;
  border-radius: 100px;
}

.mobile .button {
  width: 55px;
  height: 55px;
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
