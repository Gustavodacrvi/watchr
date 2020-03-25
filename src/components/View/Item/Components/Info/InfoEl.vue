<template>
  <span
    class="txt-wrapper"
  >
    <Icon class="txt-icon"
      :icon='props.icon'
      :color='props.color'
      width='11px'
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
