<template>
  <div class="Info">
    <transition
      appear
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <div v-if="headerInfo && (headerInfo.icons || headerInfo.comments)" class="icons">
        <HeaderInfo v-for="item in headerInfo.icons"
          :key="item.icon"
          v-bind="item"
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
    <Notes v-if="(focus || !isAddingNotes) && hasNotes"
      v-model="focus"
      :notes='headerInfo.notes.name'
      :focusOnMount='isAddingNotes'
      @save='headerInfo.notes.save'
    />
    <FileHandler v-if='hasFileHandler'
      ref='file-handler'
      :defaultFiles='headerInfo.files.names'
      :storageFolder='headerInfo.files.storageFolder'
      :id='headerInfo.files.id'
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
  props: ['headerInfo'],
  created() {
    if (this.hasNotes && !this.isAddingNotes)
      this.focus = true
  },
  data() {
    return {
      focus: false,
    }
  },
  methods: {
    openNotes() {
      this.focus = true
    },
    getHeaderInfoFile(files) {
      this.$refs['file-handler'].onDrop(files)
    },
    addFiles(files) {
      this.getHeaderInfoFile(files)
    },
    
    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0
      s.margin = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.175s'

        s.height = '25px'
        s.opacity = 1
        s.margin = '10px 0'

        setTimeout(done, 155)
      })
      
    },
    leave(el, done) {
      
      const s = el.style

      s.transitionDuration = '.175s'

      s.height = 0
      s.width = 0
      s.opacity = 0
      s.margin = 0

      setTimeout(done, 155)

    },
    tagsEnter(el, done) {

      const s = el.style
      
      s.transitionDuration = 0
      s.height = 0
      s.margin = 0 
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.175s'

        s.height = '22px'
        s.margin = '10px 0'
        s.opacity = 1

        setTimeout(done, 155)
      })

    },
    tagsLeave(el, done) {
      const s = el.style
      
      s.transitionDuration = '.175s'

      s.height = 0
      s.opacity = 0
      s.margin = 0

      setTimeout(done, 155)
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

    hasNotes() {
      return this.headerInfo && this.headerInfo.notes && this.headerInfo.notes.save
    },
    isAddingNotes() {
      return this.hasNotes && this.headerInfo.notes && this.headerInfo.notes.name === null
    },
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

.icons {
  position: relative;
  z-index: 10;
}

</style>
