<template>
  <transition name="progress-t" appear>
    <div class="progress">
      <div class="progress-line" :style="{width: `${uploadProgress}%`}"></div>
    </div>
  </transition>
</template>

<script>

export default {
  props: ['uploadProgress'], 
}

</script>

<style scoped>

.progress {
  bottom: 0;
  width: 100%;
  height: 3px;
  margin-top: 4px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  overflow: hidden;
  background-color: var(--dark);
  transition: height .1s, margin-top .1s;
}

.progress-line {
  background-color: var(--primary);
  height: 100%;
}


.progress-t-enter, .progress-t-leave-to {
  height: 0;
  margin-top: 0;
}

.progress-t-leave, .progress-t-enter-to {
  height: 3px;
  margin-top: 3px;
}

</style>
