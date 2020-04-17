<template>
  <transition name="trans" appear>
    <div v-if="dragging && !movingTask"
      class="FileDragDrop"

      @drop.prevent.stop='drop'
      @drag.stop.prevent
      @dragend.stop.prevent
      @dragstart.stop.prevent
      @dragenter.stop.prevent
      @dragleave.stop.prevent
      @dragover.stop.prevent
    >
      <div class="wrapper">
        <Icon class="icon" icon='import' width='80px' color='var(--sidebar-color)'/>
        <span class="msg">Drag it here.</span>
      </div>
    </div>
  </transition>
</template>

<script>

import { mapState } from 'vuex'

export default {
  props: ['onDrop'],
  data() {
    return {
      dragging: false,
      dragOverTimeout: null,
      onDragTimeout: null,
    }
  },
  created() {
    document.addEventListener('dragover', this.onDrag)
    document.addEventListener('dragend', this.dragEnd)
  },
  beforeDestroy() {
    document.removeEventListener('dragover', this.onDrag)
    document.removeEventListener('dragend', this.dragEnd)
  },
  methods: {
    drop(evt) {
      this.dragging = false
      if (this.onDrop)
        this.onDrop(evt.dataTransfer.files)
    },
    onDrag() {
       setTimeout(() => {
        if (this.movingTask)
          return;
        this.dragging = true
        if (this.dragOverTimeout)
          clearTimeout(this.dragOverTimeout)
  
        this.dragOverTimeout = setTimeout(() => {
          this.dragging = false
        }, 1250)
      }, 100)
    },
    dragEnd() {
      this.dragging = false
    },
  },
  computed: {
    ...mapState(['movingTask'])
  },
  watch: {
    movingTask() {
      this.dragging = false
      if (this.onDragTimeout || !this.movingTask)
        clearTimeout(this.onDragTimeout)
      if (this.movingTask)
        this.onDragTimeout = setTimeout(() => {
          this.dragging = true
        }, 100)
    },
  },
}

</script>

<style scoped>

.FileDragDrop {
  height: 80px;
  border: 2px solid var(--sidebar-color);
  border-style: dashed;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  margin: 9px;
}

.icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  opacity: 1;
  z-index: 1;
}

.msg {
  position: relative;
  z-index: 2;
}

.trans-enter, .trans-leave-to {
  transition-duration: .15s;
  transition-timing-function: 'ease-out';
  height: 0;
  opacity: 0;
  margin: 0;
}

.trans-leave, .trans-enter-to {
  transition-duration: .15s;
  transition-timing-function: 'ease-in';
  height: 80px;
  opacity: 1;
  margin: 9px;
}

</style>
