<template>
  <div class="InfoList">
    <div v-for="l in links" :key="l.name"
      class="option"
    >
      <span v-if="l.name"
        class="sect name-wrapper"
      >
        <span v-if="l.icon" class="icon">
          <Icon
            :icon='l.icon.name'
            :color='l.color'
            width='16px'
          />
        </span>
        <span class="name">
          {{ l.name }}
        </span>
      </span>
      <span v-if="l.info"
        class="sect"
      >
        {{ l.name }}
      </span>
    </div>
  </div>
</template>

<script>

export default {
  props: ['callback', 'links'],
}

</script>

<style scoped>

.option {
  display: flex;
  flex-direction: column;
}

.sect {
  padding: 12px;
}

</style>
