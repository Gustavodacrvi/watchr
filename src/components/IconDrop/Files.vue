
<template>
  <div class="Files" :class="platform">
    <div class="files">
      <FileApp v-for="f in getFiles" :key="f"
        :name="f"
        :status='getFileStatus(f)'
        @delete="() => deleteFile(f)"
        @download="() => downloadFile(f, content.storageFolder, content.id)"
        @view="() => viewFile(f, content.storageFolder, content.id)"
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
    <input v-show="false"
      ref='file'
      type='file'
      @click.stop
      @change='handleFile'
    >
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
        files: this.content.savedFiles.slice(),
      },
      task: {
        files: this.content.savedFiles.slice(),
      },
      addedFiles: [],
      savingTask: false,
      uploadProgress: null,
    }
  },
  methods: {
    saveCompFiles() {
      const files = this.task.files
      this.saveFiles(this.getFilesToRemove, this.addedFiles, this.content.id, this.content.storageFolder).then(res => {
        this.content.callback(files)
        this.$emit('close')
      })
    },
    addCompFile() {
      if (this.fileInput)
        this.fileInput.click()
    },
    handleFile() {
      const inp = this.fileInput
      if (inp.files[0])
        this.addFile(inp.files[0])
      inp.value = ''
    }
  },
  computed: {
    ...mapGetters(['l', 'platform']),
    fileInput() {
      return this.$refs['file']
    },
  },
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
