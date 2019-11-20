
<template>
  <div class="Files" :class="platform">
    <div class="files">
      <FileApp v-for="f in getFiles" :key="f"
        :name="f"
        :status='getFileStatus(f)'
        @delete="() => deleteFile(f)"
        @download="() => downloadFile(f)"
        @view="() => viewFile(f)"
      />
    </div>
    <div class="buttons">
      <ButtonApp class="btn"
        :value="l['Save files']"
        @click="saveCompFiles"
      />
      <ButtonApp class="btn"
        :value="l['Add file']"
        @click="addCompFile"
      />
    </div>
  </div>
</template>

<script>

import FileApp from '@/components/View/Tasks/File.vue'
import ButtonApp from '@/components/Auth/Button.vue'

import FileMixin from '@/mixins/file.js'

import { mapGetters } from 'vuex'

export default {
  mixins: [FileMixin],
  props: ['content'],
  components: {
    ButtonApp, FileApp,
  },
  data() {
    return {
      defaultTask: {
        files: this.content.savedFiles,
      },
      task: {
        files: [],
      },
      addedFiles: [],
    }
  },
  methods: {
    saveCompFiles() {

    },
    addCompFile() {
      
    },
  },
  computed: {
    ...mapGetters(['l', 'platform']),
  }
}

</script>

<style scoped>

.Files {
  width: 330px;
  margin: 0 20px;
}

.files {
  min-height: 50px;
}

.buttons {
  display: flex;
}

.btn + .btn {
  margin-left: 4px;
}

</style>
