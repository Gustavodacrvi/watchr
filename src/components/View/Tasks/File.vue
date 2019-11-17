
<template>
  <div class="File rb cursor" :class="status" @click.stop>
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
  props: ['name', 'status'],
  components: {
    Icon,
  },
  mounted() {
    utils.bindOptionsToEventListener(this.$el, this.options, this.$parent, 'click')
  },
  computed: {
    options() {
      return [
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
          name: 'Edit file name',
          icon: 'pen',
          callback: () => this.$emit('edit')
        },
        {
          name: 'Delete file',
          icon: 'trash',
          important: true,
          callback: () => {this.$emit('delete')}
        },
      ]
    },
  },
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

.update {
  background-color: rgba(53, 73, 90, 0.6) !important;
}

.remove {
  opacity: .2;
}

</style>
