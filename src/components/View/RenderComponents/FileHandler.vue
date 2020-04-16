<template>
  <transition
    appear

    :css='false'
    @enter='enter'
    @leave='leave'
  >
    <div class="FileHandler">
      <FileDragDrop :onDrop='onDrop'/>
      <File v-for="f in getFiles" :key="f"
        :name="f"
        :status='getFileStatus(f)'
        @delete="deleteFile(f)"
        @download="downloadFile(f, id)"
        @view="viewFile(f, id)"
      />
      <transition name="progress-t">
        <div v-if="saving" class="progress">
          <div class="progress-line" :style="{width: `${uploadProgress}%`}"></div>
        </div>
      </transition>
      <AuthButton v-if='isEditingFiles'
        type='dark'
        value='Save changes'
        @click="saveCompFiles"
      />
    </div>
  </transition>
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
  props: ['id'],
  data() {
    return {
      saving: false,
    }
  },
  methods: {
    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.margin = '0'

      requestAnimationFrame(() => {
        s.transitionDuration = '.175s'
        s.margin = '12px 0'

        setTimeout(176, done)
      })
    },
    leave(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.margin = '12px 0'

      requestAnimationFrame(() => {
        s.transitionDuration = '.175s'
        s.margin = '0'

        setTimeout(176, done)
      })
    },
    
    saveCompFiles() {
      this.saving = true
      const files = this.files
      this.saveFiles(this.getFilesToRemove, this.addedFiles, this.id).then(res => {
        this.$emit('save', files)
        this.addedFiles = []
        this.$store.commit('pushToast', {
          name: 'Changes saved.',
          seconds: 2,
          type: 'success',
        })
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

.FileHandler {
  margin: 12px 0;
}

.progress {
  bottom: 0;
  width: 100%;
  height: 3px;
  margin-top: 4px;
  border-radius: 14px;
  overflow: hidden;
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
