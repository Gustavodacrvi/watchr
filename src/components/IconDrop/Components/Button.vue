<template>
  <button class="Button"
    :class="{isActive}"
    :style="{backgroundColor: isActive ? primaryColor : ''}"
    
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <Icon v-if="icon"
      class="icon"
      width='14px'
      :icon='icon'
      :color='color'
    />
    <span class="value" :style='{color}'>
      {{ value }}
    </span>
  </button>
</template>

<script>

export default {
  props: ['value', 'icon', 'defaultColor', 'active'],
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    isActive() {
      return this.hover || this.active
    },
    primaryColor() {
      return this.defaultColor || 'var(--primary)'
    },
    color() {
      return this.isActive ? "var(--dark-void)" : (this.defaultColor || "var(--txt)")
    },
  },
}

</script>

<style scoped>

.Button {
  background-color: var(--dark-light-gray);
  padding: 8px;
  width: 100%;
  text-align: left;
  outline: none;
  font-size: 1em;
  display: flex;
  align-items: center;
  white-space: nowrap;
  transition-duration: .175s;;
}

.Button.isActive {
  color: var(--dark-void);
}

.icon {
  transform: translateY(2px);
}

.value {
  margin-left: 8px;
  display: flex;
  align-items: center;
  transform: translateY(1px);
}

.border-radius {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

</style>
