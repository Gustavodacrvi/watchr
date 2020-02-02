<template>
  <div class="FileHandler">
    <File v-for="f in files" :key="f"
      :name="f"
      :status='getFileStatus(f)'
      @delete="onDelete(f)"
      @download="onDownload(f, storageFolder, id)"
      @view="onView(f, storageFolder, id)"
    />
  </div>
</template>

<script>

import File from '@/components/View/RenderComponents/File.vue'
import FileDragDrop from '@/components/View/RenderComponents/FileDragDrop.vue'

import fileMixin from '@/mixins/file.js'

export default {
  mixins: [fileMixin],
  components: {
    FileDragDrop,
    File,
  },
  props: ['storageFolder', 'id'],
}


</script>

