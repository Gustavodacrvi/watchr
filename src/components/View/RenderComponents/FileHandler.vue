<template>
  <div class="FileHandler">
    <File v-for="f in getFiles" :key="f"
      :name="f"
      :status='getFileStatus(f)'
      @delete="deleteFile(f)"
      @download="downloadFile(f, storageFolder, id)"
      @view="viewFile(f, storageFolder, id)"
    />
    <AuthButton v-if='isEditingFiles'
      type='dark'
      value='Save changes'
      @click="saveCompFiles"
    />
    <transition name="progress-t">
      <div v-if="saving" class="progress">
        <div class="progress-line" :style="{width: `${uploadProgress}%`}"></div>
      </div>
    </transition>
  </div>
</template>

<script>

import File from '@/components/View/RenderComponents/File.vue'
import FileDragDrop from '@/components/View/RenderComponents/FileDragDrop.vue'
import AuthButton from '@/components/Auth/Button.vue'

import fileMixin from '@/mixins/file.js'

export default {
  mixins: [fileMixin],
  components: {
    FileDragDrop,
    File, AuthButton,
  },
  props: ['storageFolder', 'id'],
  data() {
    return {
      saving: false,
    }
  },
  methods: {
    saveCompFiles() {
      this.saving = true
      const files = this.files
      this.saveFiles(this.getFilesToRemove, this.addedFiles, this.id, this.storageFolder).then(res => {
        this.$emit('save', files)
        this.saving = false
      }).catch(() => {
        this.saving = false
        this.$store.commit('pushToast', {
          name: 'An error occurred while saving changes.',
          seconds: 4,
          type: 'error',
        })
      })
    },
  },
}


</script>

<style scoped>

.progress {
  bottom: 0;
  width: 100%;
  height: 3px;
  margin-top: 4px;
  border-radius: 14px;
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
