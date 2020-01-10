<template>
  <div class="Notes" :class="{hasNotes: notes}">
    <span v-if="isDesktop && notes && editingNote" class="msg">Shift + Enter to save</span>
    <p v-if="notes && !editingNote" class="saved-notes" @click="editingNote = true" :class="platform">{{ notes }}</p>
    <textarea v-show="notes && editingNote" @click.stop
    :value='note'
    @input='v => note = v.target.value'
    ref="notes"
    class="notes"
    @keyup="keyup"
    @keydown="noteKeydown"
  ></textarea>
  <div v-if="!isDesktop && notes && editingNote">
    <AuthButton
      type='card'
      value='Save notes'
      @click="saveNotes"
    />
  </div>
</div>
</template>

<script>

import AuthButton from '@/components/Auth/Button.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    AuthButton,
  },
  props: ['notes'],
  data() {
    return {
      editingNote: false,
      note: this.notes,
      shift: false,
    }
  },
  mounted() {
    this.fixHeight()
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.windowClick)
  },
  methods: {
    windowClick(evt) {
      let found = false
      for (const node of evt.path)
        if (node === this.$el)
          found = true
      if (!found) this.editingNote = false
    },
    keyup({key}) {
      if (key === 'Shift') this.shift = false
    },
    focusOnNotes() {
      setTimeout(() => {
        const el = this.$refs.notes
        if (el) el.focus()
      }, 100)
    },
    fixHeight() {
      setTimeout(() => {
        const el = this.$refs.notes
        if (el) {
          el.style.height = '5px'
          el.style.height = (el.scrollHeight) + 'px'
        }
      })
    },
    saveNotes() {
      this.$emit('save-notes', this.note.trim())
      this.editingNote = false
    },
    noteKeydown(evt) {
      this.fixHeight()
      const {key} = evt
      if (key === 'Shift') this.shift = true
      else if (key === 'Enter' && this.shift) this.saveNotes()
    },
    hide() {
      this.editing = false
      this.editingNote = false
    },
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop']),
  },
  watch: {
    editingNote() {
      this.fixHeight()
      if (this.editingNote)
        this.focusOnNotes()
    },
    notes() {
      this.note = this.notes
    },
  }
}

</script>

<style scoped>

.Notes {
  position: relative;
}

.hasNotes {
  margin: 16px 0 !important;
}

.msg {
  position: absolute;
  right: 0;
  bottom: 0;
  opacity: .4;
  font-size: .7em;
}

.saved-notes {
  margin: 0;
  white-space: pre-line;
}

.notes {
  background-color: var(--back-color);
  border: none;
  font-size: 1em;
  width: 100%;
  outline: none;
  resize: none;
  overflow: hidden;
}

</style>
