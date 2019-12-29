<template>
  <div class="PomoClock">
    <svg viewBox='0 0 100 100' width='300px' height='300px'>
      <circle ref='circle' class="pie" stroke-width="2px" cx="50%" cy="50%" r="40" stroke-dasharray='1 300'/>
    </svg>
  </div>
</template>

<script>

// 252

export default {
  
}

</script>

<style scoped>

.PomoClock {
  filter: drop-shadow(0 0 20px rgba(234, 58, 52, .4));
}

.pie {
  fill: none;
  stroke: var(--dark-red);
  transform: rotate(-90deg);
  transform-origin: 50%; 
}

</style>
