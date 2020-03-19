<template>
  <Icon
    :icon='getIcon'
    :width='active ? "11px" : "7px"'
    :color='!hasTaskInDate ? "var(--fade)" : "var(--purple)"'
  />
</template>

<script>

export default {
  props: ['date', 'month', 'year', 'active'],
  computed: {
    hasTaskInDate() {
      return this.$store.getters['task/tasks'].some(task =>
        this.$store.getters['task/isTaskShowingOnDate'](task, `${this.year}-${this.month}-${this.date}`, false, true)
      )
    },
    getIcon() {
      if (this.active)
        return 'star'
      return !this.hasTaskInDate ? "circle" : "circle-filled"
    },
  },
}

</script>
