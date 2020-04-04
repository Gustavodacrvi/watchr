<template functional>
  <span
    class="txt-wrapper"
  >
    <Icon class="txt-icon"
      :icon='props.icon'
      :color='props.color'
      width='10px'
    />
    <span class="txt-name">
      {{ props.name }}
    </span>
  </span>
</template>

<script>

export default {
  props: ['icon', 'name', 'color']
}

</script>

<style scoped>

.txt-wrapper {
  display: inline-flex;
  align-items: center;
}

.txt-wrapper + .txt-wrapper {
  margin-left: 6px;
}

.txt-icon {
  transform: translateY(1px);
}

.txt-name {
  margin-left: 4px;
}

</style>
