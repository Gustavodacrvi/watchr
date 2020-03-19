<template functional>
  <div
    class="time-line"
    :class="{active: props.active}"

    :style="{top: props.top}"
  >
    <div class="line-wrapper">
      <div class="line"></div>
      <div class="time">{{ props.time }}</div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['top', 'time', 'active'],
}

</script>

<style scoped>

.time-line {
  position: absolute;
  width: 100%;
  pointer-events: none;
}

.line-wrapper {
  position: relative;
}

.time {
  color: var(--fade);
  position: absolute;
  transform: translateY(-55%);
  display: inline-block;
  background-color: var(--sidebar-color);
  padding: 0 8px;
  padding-left: 0;
}

.line {
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  border: 1px solid var(--light-gray);
}

.active {
  z-index: 2;
}

.active .time {
  color: var(--purple);
}

.active .line {
  border: 1px solid var(--purple);
}

</style>
