<template>
  <div style="margin-top: 18px">
    <FileApp v-for="f in files.files" :key="f"
      :name="f"
      :disableDelete='true'
      @delete="deleteFile(f)"
      @download="downloadFile(f, files.storageFolder, files.id)"
      @view="viewFile(f, files.storageFolder, files.id)"
    />
  </div>
</template>

<script>

import FileMixin from '@/mixins/file.js'

import FileApp from '@/components/View/Tasks/File.vue'

import { mapState } from 'vuex'

export default {
  props: ['files'],
  mixins: [FileMixin],
  components: {
    FileApp,
  },
  computed: {
    ...mapState(['userInfo']),
  }
}

</script>
