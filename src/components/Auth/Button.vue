<template>
  <button class="Button cbd" @click="$emit('click')">{{ value }}</button>  
</template>

<script>

export default {
  props: ['value'] 
}

</script>

<style scoped>

.Button {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 1.01em;
  cursor: pointer;
  transition-duration: .2s;
  outline: none;
}

.Button:hover, .Button:focus {
  background-color: var(--light-gray);
  color: white;
}

.tiny {
  padding: 8px;
}

.no-back {
  background-color: var(--back-color);
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 8px;
}

.no-back:hover {
  background-color: var(--primary);
  color: white;
}

</style>
