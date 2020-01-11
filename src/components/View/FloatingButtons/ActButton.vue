<template>
  <div class="ActButton floating-button-handle" :class="platform">
    <div class="floating no-pointer">
      <div class="inner-ball-button remove-highlight">
        <Icon class="icon"
          :icon="icon"
          :color="color"
        />
        <div class="path"></div>
      </div>
    </div>
    <div class="act-button-wrapper" :style='styles'>
      <div class="heading cont side action-heading">
        <div class="floating-btn-msg task-act no-pointer">
          {{ l['Heading'] }}
        </div>
      </div>
      <div class="main cont create">
        <div class="floating-btn-msg task-act no-pointer">
          {{ txt }}
        </div>
        <div class="floating-btn-msg tags-act no-pointer">
          {{ l["Add tag"] }}
        </div>
        <div class="floating-btn-msg list-act no-pointer">
          {{ l["Add list"] }}
        </div>
      </div>
      <div class="existing side cont add">
        <div class="floating-btn-msg task-act no-pointer">
          {{ l['Add'] }}
        </div>
      </div>
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
    ...mapGetters(['l', 'platform', 'isDesktop']),
    styles() {
      const height = (this.isDesktop ? 40 : 50) + 'px'
      return {
        height,
      }
    }
  }
}

</script>

<style scoped>

.ActButton, .inner-ball-button {
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: 0s !important;
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
  background-color: var(--card);
  box-shadow: 0 3px 8px rgba(15,15,15,.3);
}


.bright .inner-ball-button {
  color: white;
  box-shadow: 0 0 24px rgba(89, 160, 222, .2);
  background-color: rgba(89, 160, 222, .9);
}

.bright .inner-ball-button:hover {
  transition: box-shadow .2s;
  box-shadow: 0 0 24px rgba(120, 201, 263, .2);
}

.mobile .no-pointer {
  pointer-events: none;
}

.mobile .inner-ball-button {
  height: 55px;
  width: 55px;
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

.bright .path {
  background-color: rgba(120, 201, 263, .9);
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
