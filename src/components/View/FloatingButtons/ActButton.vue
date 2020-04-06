<template>
  <div class="ActButton floating-button-handle" :class="layout">
    <div class="act-button-wrapper" :style='styles'>
      <div class="heading cont side action-heading">
        <div class="floating-btn-msg task-act no-pointer">
          <h3>Add heading</h3>
        </div>
      </div>
      <div class="main cont create">
        <div class="floating-btn-msg task-act no-pointer">
          {{ txt }}
        </div>
        <div class="floating-btn-msg tags-act no-pointer">
          Add tag
        </div>
        <div class="floating-btn-msg list-act no-pointer">
          Add list
        </div>
      </div>
    </div>
    <div class="floating no-pointer">
      <div class="inner-ball-button remove-highlight">
        <Icon class="icon"
          :icon="icon"
          :color="color"
          :width='isDesktopBreakPoint ? "" : "20px"'
        />
        <div class="path"></div>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: ['icon', 'color' ,'txt'],
  computed: {
    ...mapGetters(['layout', 'isDesktopBreakPoint']),
    styles() {
      const height = (this.isDesktopBreakPoint ? 25 : 50) + 'px'
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
  transition-duration: 0s;
  position: relative;
}

.floating {
  position: relative;
  transform: scale(1,1);
  transition-duration: .3s;
}

.cont {
  position: absolute;
  width: 100%;
}

.floating:hover {
  transform: scale(1.1,1.1);
}

.floating:active {
  transform: scale(.95,.95);
}

.inner-ball-button {
  position: relative;
  transition-duration: .3s;
  width: 32px;
  height: 32px;
  z-index: 10;
  overflow: hidden;
  cursor: grab;
  border-radius: 1000px;
  background-color: var(--card);
  box-shadow: 0 3px 8px rgba(15,15,15,.3);
}

.inner-ball-button:active {
  cursor: grabbing;
}


.bright .inner-ball-button {
  color: white;
  box-shadow: 0 0 24px rgba(89, 160, 222, .2);
  background-color: var(--primary);
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
  background-color: rgb(120, 201, 263);
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
