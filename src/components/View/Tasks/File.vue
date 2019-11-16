
<template>
  <div class="File rb cursor" @click.stop>
    <span class="icon-wrapper">
      <Icon icon='file' style="opacity: .6;" width="12px"/>
    </span>
    <span class="name">{{ name }}</span>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

import utils from '@/utils'

export default {
  props: ['name'],
  mounted() {
    utils.bindOptionsToEventListener(this.$el, [
      {
        name: 'View content',
        icon: 'file',
        callback: () => this.$emit('view')
      },
      {
        name: 'Download file',
        icon: 'import',
        callback: () => this.$emit('download')
      },
      {
        name: 'Delete file',
        icon: 'trash',
        callback: () => this.$emit('delete')
      },
    ], this, 'click')
  },
  components: {
    Icon,
  }
}

</script>

<style scoped>

.File {
  display: flex;
  align-items: center;
  min-height: 25px;
  transition-duration: .2s;
}

.File:hover {
  background-color: var(--light-gray);
}

.icon-wrapper {
  margin-right: 6px;
  margin-left: 8px;
  transform: translateY(1px);
}

.name {
  word-break: break-all;
  word-wrap: break-word;
}

</style>
