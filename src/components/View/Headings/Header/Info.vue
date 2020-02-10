<template>
  <div class="Info">
    <transition
      appear
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <div v-if="headerInfo && (headerInfo.icons || hasFileHandler || headerInfo.comments)">
        <HeaderInfo v-for="item in headerInfo.icons"
          :key="item.icon"
          v-bind="item"
        />
        <HeaderInfo v-if="hasFileHandler"
          :key="hasFileHandler + 'asdf'"
          icon='file'
          title='Add file'
          @add='getHeaderInfoFile'
        />
        <HeaderInfo v-if="headerInfo.comments"
          :key="'faskasdf' + false"
          icon='comment'
          :number='getNonReadComments'
          title='Group chat'
          @click.native="openComments"
        />
      </div>
    </transition>
    <transition
      appear
      @enter='tagsEnter'
      @leave='tagsLeave'
    >
      <div v-if="headerInfo && headerInfo.tags && headerInfo.tags.names && headerInfo.tags.names.length > 0" key="tag"
        class="tags-wrapper"
      >
        <Tag v-for="n in headerInfo.tags.names" :key="n"
          icon='tag'
          color='var(--red)'
          :value="n"
          @click="headerInfo.tags.remove(n)"
        />
      </div>
    </transition>
    <Notes v-if="headerInfo && headerInfo.notes && headerInfo.notes.name !== undefined"
      :notes='headerInfo.notes.name'
      @save='headerInfo.notes.save'
    />
    <FileHandler v-if='hasFileHandler'
      :defaultFiles='headerInfo.files.names'
      :storageFolder='headerInfo.files.storageFolder'
      :id='headerInfo.files.id'
      :fileToggle='fileToggle'
      @empty-toggle='emptyToggle'
      @save='headerInfo.files.save'
    />
  </div>
</template>

<script>

// files

import FileHandler from './../../RenderComponents/FileHandler.vue'
import HeaderInfo from './../HeaderInfo.vue'
import Tag from '../../Tag.vue'
import Notes from '../Notes.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    HeaderInfo, Tag, Notes,
    FileHandler,
  },
  data() {
    return {
      fileToggle: null,
    }
  },
  props: ['headerInfo'],
  methods: {
    emptyToggle() {
      this.fileToggle = null
    },
    getHeaderInfoFile(file) {
      this.fileToggle = file
    },
    
    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0
      s.margin = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'

        s.height = '35px'
        s.opacity = 1
        s.margin = '10px 0'

        setTimeout(done, 255)
      })
      
    },
    leave(el, done) {
      
      const s = el.style

      s.transitionDuration = '.25s'

      s.height = 0
      s.opacity = 0
      s.margin = 0

      setTimeout(done, 255)

    },
    tagsEnter(el, done) {

      const s = el.style
      
      s.transitionDuration = 0
      s.height = 0
      s.margin = 0 
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'

        s.height = '22px'
        s.margin = '10px 0'
        s.opacity = 1

        setTimeout(done, 255)
      })

    },
    tagsLeave(el, done) {
      const s = el.style
      
      s.transitionDuration = '.25s'

      s.height = 0
      s.opacity = 0
      s.margin = 0

      setTimeout(done, 255)
    },
    openComments() {
      this.$store.dispatch('pushPopup', {
        comp: "Comments",
        payload: {
          groupId: this.headerInfo.comments.group,
          id: this.headerInfo.comments.room,
        },
      })
    },
  },
  computed: {
    ...mapGetters({
      nonReadCommentsById: 'group/nonReadCommentsById',
    }),
    getNonReadComments() {
      return this.nonReadCommentsById(this.headerInfo.comments.group, this.headerInfo.comments.room).length
    },
    hasFileHandler() {
      return this.headerInfo && this.headerInfo.files && this.headerInfo.files.names
    },
  },
}

</script>

<style scoped>

.tags-wrapper {
  display: flex;
}

</style>
