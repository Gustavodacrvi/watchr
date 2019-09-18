<template>
  <div class="Popup" @click="$emit('close')">
    <div class="card">
      asçlkjdffdas
    </div>
  </div>
</template>

<script>

export default {
  
}

</script>

<style scoped>

.Popup {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: rgba(0,0,0,.5);
  z-index: 100;
}

.card {
  background-color: var(--card);
  width: 100px;
  height: 100px;
  margin-top: 200px;
}

</style>
