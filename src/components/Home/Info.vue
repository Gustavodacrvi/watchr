
<template functional>
  <span class="Info">
    <span class="handle">
      {{ props.handle }}
    </span>
    <span class="cont shadow rb cb">
      <slot></slot>
    </span>
  </span>
</template>

<script>

export default {
  props: ['handle'],  
}

</script>

<style scoped>

.Info {
  position: relative;
}

.handle {
  color: white;
}

.handle:hover {
  text-decoration: underline;
}

.cont {
  opacity: 0;
  left: 50%;
  transform: translateX(-50%) scale(.9,.9);
  bottom: 175%;
  transition-duration: .1s;
  transition-delay: .1s;

  width: 325px;
  visibility: hidden;
  font-size: .9em;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px;
}

.Info:hover .cont {
  opacity: 1;
  bottom: 125%;
  visibility: visible;
  transform: translateX(-50%) scale(1,1);
}

</style>
