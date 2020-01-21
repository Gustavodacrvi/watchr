
<template>
  <div class="Files" :class="platform">
    <div class="files"
      @drop.prevent.stop='drop'
      @drag.stop.prevent
      @dragend.stop.prevent
      @dragstart.stop.prevent
      @dragenter.stop.prevent
      @dragleave.stop.prevent
      @dragover.stop.prevent
    >
      <FileApp v-for="f in getFiles" :key="f"
        :name="f"
        :status='getFileStatus(f)'
        @delete="onDelete(f)"
        @download="onDownload(f, content.storageFolder, content.id)"
        @view="onView(f, content.storageFolder, content.id)"
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
    <transition name="progress-t">
      <div v-if="savingTask" class="progress">
        <div class="progress-line" :style="{width: `${uploadProgress}%`}"></div>
      </div>
    </transition>
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
    drop(evt) {
      const files = evt.dataTransfer.files
      for (const f of files)
        this.addFile(f)
    },
    onDelete(f) {
      this.deleteFile(f)
    },
    onDownload(f, storageFolder, id) {
      this.downloadFile(f, storageFolder, id)
    },
    onView(f, storageFolder, id) {
      this.viewFile(f, storageFolder, id)
    },
    saveCompFiles() {
      this.savingTask = true
      const files = this.task.files
      this.saveFiles(this.getFilesToRemove, this.addedFiles, this.content.id, this.content.storageFolder).then(res => {
        this.content.callback(files)
        this.$emit('close')
      }).catch(() => {
        this.$emit('close')
        this.$store.commit('pushToast', {
          name: this.l['An error occurred while editing files.'],
          seconds: 4,
          type: 'error',
        })
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
  watch: {
    getFiles() {
      this.$emit('calc')
    }
  }
}

</script>

<style scoped>

.Files {
  width: 330px;
  margin: 0 20px;
  position: relative;
  box-sizing: border-box;
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

.progress {
  position: absolute;
  bottom: -18px;
  left: -20px;
  width: 370px;
  height: 3px;
  margin-top: 4px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  overflow: hidden;
  background-color: var(--dark);
  transition: height .1s, margin-top .1s;
}

.progress-line {
  background-color: var(--primary);
  height: 100%;
}

.progress-t-enter, .progress-t-leave-to {
  height: 0;
  margin-top: 0;
}

.progress-t-leave, .progress-t-enter-to {
  height: 3px;
  margin-top: 3px;
}

</style>
