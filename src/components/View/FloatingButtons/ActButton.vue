<template>
  <div class="ActButton handle" :class="platform">
    <div class="floating">
      <div class="inner-ball-button cb shadow">
        <Icon class="icon"
          :icon="icon"
          :color="color"
        />
        <div class="path"></div>
      </div>
    </div>
    <div class="floating-btn-msg task-act">
      {{ txt }}
    </div>
    <div class="floating-btn-msg tags-act">
      {{ l["Add tag"] }}
    </div>
    <div class="floating-btn-msg list-act">
      {{ l["Add list"] }}
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

.ActButton, .inner-ball-button {
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

.inner-ball-button {
  position: relative;
  transition-duration: .3s;
  width: 50px;
  height: 50px;
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

.inner-ball-button:hover .path {
  clip-path: circle(50px);
}

.inner-ball-button:active .path {
  background-color: var(--primary);
}

.icon {
  position: relative;
  transform: translateY(2px);
  z-index: 11;
}

</style>
