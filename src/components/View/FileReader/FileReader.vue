
<template>
  <div class="FileReader" @click="hide">
    <div class="cb rb shadow" @click.stop>
      <transition name="fade-t">
        <component :is="status" :hideTitle='true' :blob="blob"/>
      </transition>
      <div v-show="status === 'LoadingComponent'" class="progress">
        <div class="line" :style="`width: ${progress}%`"></div>
      </div>
    </div>
  </div>
</template>

<script>

import LoadingComponent from '@/components/Illustrations/LoadingComponent.vue'
import ErrorComponent from '@/components/Illustrations/ErrorComponent.vue'
import TxtApp from './Txt.vue'
import ImageApp from './Image.vue'
import AudioApp from './Audio.vue'
import VideoApp from './Video.vue'

import { mapState, mapGetters } from 'vuex'

import utils from "@/utils"

export default {
  components: {
    LoadingComponent, ErrorComponent,
    TxtApp, ImageApp, AudioApp, VideoApp,
  },
  data() {
    return {
      status: 'LoadingComponent',
      blob: null,
      progress: 0,
    }
  },
  created() {
    utils.downloadBlobFromURL(this.fileURL, this.getProgress).then(blob => {
      const t = blob.type
      if (t.includes('text/'))
        this.status = 'TxtApp'
      else if (t.includes('image/'))
        this.status = 'ImageApp'
      else if (t.includes('audio/'))
        this.status = 'AudioApp'
      else if (t.includes('video/'))
        this.status = 'VideoApp'
      else {
        this.$store.commit('pushToast', {
          name: 'File not supported.',
          seconds: 4,
          type: 'error',
        })
        this.$store.commit('readFile', null)
      }
      this.blob = blob
    }).catch(this.error)
  },
  methods: {
    getProgress(evt) {
      this.progress = (evt.loaded / evt.total) * 100
    },
    error() {
      this.status = 'ErrorComponent'
      this.$store.commit('pushToast', {
        name: 'An error occurred while downloading file',
        seconds: 4,
        type: 'error',
      })
    },
    hide() {
      this.$store.commit('readFile', null)
    },
  },
  computed: {
    ...mapState(['fileURL']),
  },
}

</script>

<style scoped>

.FileReader {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 700;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cb {
  position: relative;
  padding: 42px;
  margin: 0 8px;
}

.progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: var(--dark);
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  overflow: hidden;
}

.line {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: var(--primary);
  height: 100%;
}

</style>
