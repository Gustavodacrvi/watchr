
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

import { mapState, mapGetters } from 'vuex'

import utils from "@/utils"

export default {
  components: {
    LoadingComponent, ErrorComponent,
    TxtApp, ImageApp,
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
      switch (blob.type) {
        case "text/plain": {
          this.status = 'TxtApp'
          break
        }
        case "image/png": {
          this.status = 'ImageApp'
          break
        }
      }
      this.blob = blob
    }).catch(this.error)
  },
  methods: {
    getProgress(evt) {
      console.log(evt)
      this.progress = (evt.loaded / evt.total) * 100
    },
    error() {
      this.status = 'ErrorComponent'
      this.$store.commit('pushToast', {
        name: this.l['An error occurred while downloading file'],
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
    ...mapGetters(['l']),
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
