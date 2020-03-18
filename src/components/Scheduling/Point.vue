<template>
  <Icon
    width='7px'
    :icon='!hasTaskInDate ? "circle" : "circle-filled"'
    :color='!hasTaskInDate ? "var(--fade)" : "var(--purple)"'
  />
</template>

<script>

export default {
  props: ['date', 'month', 'year'],
  computed: {
    hasTaskInDate() {
      return this.$store.getters['task/tasks'].some(task =>
        this.$store.getters['task/isTaskShowingOnDate'](task, `${this.year}-${this.month}-${this.date}`, false, true)
      )
    },
  },
}

</script>
