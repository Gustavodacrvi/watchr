<template>
  <button class="Button cbd" :class="getType" @click="$emit('click')">{{ value }}</button>  
</template>

<script>

export default {
  props: ['value', 'type'],
  computed: {
    getType() {
      if (!this.type) return 'normal'
      return this.type
    }
  } 
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
  transition-duration: .15s;
  outline: none;
}

.Button.normal:hover, .Button.normal:focus {
  background-color: var(--light-gray);
  color: white;
}

.tiny.normal {
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

.dark, .card {
  display: inline-block;
  margin-top: 8px;
  width: unset;
  padding: 10px;
  color: var(--gray);
  transform: scale(1,1);
  transition-duration: .15s;
}

.dark:active, .card:active {
  transform: scale(.9,.9);
}

.dark {
  background-color: var(--back-color);
}

.dark:hover {
  background-color: var(--dark);
}

.card {
  background-color: var(--card);
  color: var(--white);
}

.card:hover {
  background-color: var(--dark);
}

</style>
