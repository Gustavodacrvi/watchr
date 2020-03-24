<template>
  <transition
    appear

    name='trans'
  >
    <div class="TimelineRuler">

    </div>
  </transition>
</template>

<script>

export default {
  methods: {
  },
}

</script>

<style scoped>

.TimelineRuler {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 100%;
  border: 5px solid var(--purple);
  cursor: grab;
  border-top: 0 solid transparent;
  border-bottom: 0 solid transparent;
  background-color: rgba(161, 96, 235, .1);
  z-index: 3;
}

.trans-enter, .trans-leave-to {
  transition-duration: .2s;
  transform: scaleX(2);
  border: 0px solid var(--purple);
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  transition-duration: .2s;
  transform: scaleX(1);
  border: 5px solid var(--purple);
  opacity: 1;
}

.trans-leave-active, .trans-enter-active {
  border-top: 0 solid transparent;
  border-bottom: 0 solid transparent;
}

</style>
