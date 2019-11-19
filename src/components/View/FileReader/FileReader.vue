
<template>
  <div class="FileReader" @click="hide">
    <div class="cb rb shadow" @click.stop>
      <transition name="fade-t">
        <component :is="status" :hideTitle='true'/>
      </transition>
      {{blob}}
    </div>
  </div>
</template>

<script>

import LoadingComponent from '@/components/Illustrations/LoadingComponent.vue'
import ErrorComponent from '@/components/Illustrations/ErrorComponent.vue'

import { mapState, mapGetters } from 'vuex'

import utils from "@/utils"

export default {
  components: {
    LoadingComponent, ErrorComponent,
  },
  data() {
    return {
      status: 'LoadingComponent',
      blob: null,
    }
  },
  created() {
    utils.downloadBlobFromURL(this.fileURL).then(blob => {
      console.log(blob)
      this.blob = blob
    }).catch(this.error)
  },
  methods: {
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
  padding: 42px;
}

</style>
