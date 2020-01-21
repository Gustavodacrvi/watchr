<template>
  <transition name="trans" appear>
    <div v-if="dragging"
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
        <Icon class="icon" icon='import' width='100px'/>
        Drag it here.
      </div>
    </div>
  </transition>
</template>

<script>

import Icon from "@/components/Icon.vue"

export default {
  components: {
    Icon,
  },
  props: ['onDrop'],
  data() {
    return {
      dragging: false,
      dragOverTimeout: null,
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
      this.dragging = true
      if (this.dragOverTimeout)
        clearTimeout(this.dragOverTimeout)

      this.dragOverTimeout = setTimeout(() => {
        this.dragging = false
      }, 3000)
    },
    dragEnd() {
      this.dragging = false
    },
  },
}

</script>

<style scoped>

.FileDragDrop {
  height: 125px;
  border: 2px solid var(--fade);
  border-style: dashed;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.icon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  opacity: .1;
}

.trans-enter, .trans-leave-to {
  transition-duration: .2s;
  transition-timing-function: 'ease-out';
  height: 0;
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  transition-duration: .2s;
  transition-timing-function: 'ease-in';
  height: 125px;
  opacity: 1;
}

</style>
