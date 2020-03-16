<template>
  <button class="Button" :class="{hover}"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <Icon
      width='18px'
      :icon='icon'
      :color='hover ? "var(--dark-void)" : (defaultColor || "var(--txt)")'
    />
    <span class="value">
      {{ value }}
    </span>
  </button>
</template>

<script>

export default {
  props: ['value', 'icon', 'defaultColor'],
  data() {
    return {
      hover: false,
    }
  },
}

</script>

<style scoped>

.Button {
  background-color: var(--dark-light-gray);
  padding: 12px;
  width: 100%;
  text-align: left;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  transition-duration: .2s;;
}

.Button.hover {
  background-color: var(--primary);
  color: var(--dark-void);
}

.value {
  margin-left: 8px;
}

</style>
