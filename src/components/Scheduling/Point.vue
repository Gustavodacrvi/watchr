<template>
  <Icon
    :icon='getIcon'
    :width='active ? "11px" : "7px"'
    :color='getColor'
  />
</template>

<script>

export default {
  props: ['date', 'active'],
  computed: {
    hasTaskInDate() {
      return this.$store.getters['task/tasks'].some(task =>
        this.$store.getters['task/isTaskShowingOnDate'](task, this.date, true, true)
      )
    },
    getIcon() {
      if (this.active)
        return 'star'
      return !this.hasTaskInDate ? "circle" : "circle-filled"
    },
    getColor() {
      if (this.active)
        return 'var(--yellow)'
      return !this.hasTaskInDate ? "transparent" : "var(--purple)"
    },
  },
}

</script>
