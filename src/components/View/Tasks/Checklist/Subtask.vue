
<template>
  <div class="Subtask">
    <span>{{ name }}</span>
  </div>
</template>

<script>

export default {
  props: ['name'],
}
</script>

<style scoped>

.Subtask {
  background-color: purple;
}

</style>
