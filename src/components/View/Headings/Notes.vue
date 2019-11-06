<template>
  <div>
    <transition name="note-t"
      @enter='enterNote'
      @leave='leaveNote'
    >
      <div v-if="notes && !editingNote" class="saved-notes" @click.stop="editingNote = true" :class="platform">
        <p>{{ notes }}</p>
      </div>
    </transition>
    <textarea v-show="notes && editingNote" @click.stop
    :value='note'
    @input='v => note = v.target.value'
    ref="notes"
    class="notes"
    @keydown="noteKeydown"
  ></textarea>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: ['notes'],
  data() {
    return {
      editingNote: false,
      note: this.notes,
    }
  },
  mounted() {
    this.fixHeight()
  },
  methods: {
    focusOnNotes() {
      setTimeout(() => {
        const el = this.$refs.notes
        if (el) el.focus()
      }, 100)
    },
    enterNote(el) {
      const s = el.style
      const height = el.offsetHeight

      s.transitionDuration = '0s'
      s.opacity = '0'
      s.height = '0px'
      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.height = height + 'px'
        s.opacity = '1'
      })
    },
    fixHeight() {
      setTimeout(() => {
        const el =this.$refs.notes
        el.style.height = '5px'
        el.style.height = (el.scrollHeight) + 'px'
      })
    },
    leaveNote(el) {
      const s = el.style
      s.transitionDuration = '.2s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.opacity = '0'
    },
    noteKeydown(evt) {
      const {key} = evt
      if (key === "Enter") {
        evt.preventDefault()
        this.$emit('save-notes', this.note.trim())
        this.editingNote = false
      }
    },
    hide() {
      this.editing = false
      this.editingNote = false
    },
  },
  computed: {
    ...mapGetters(['platform']),
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

.saved-notes.mobile {
  margin: 0 12px;
}

.notes {
  background-color: var(--back-color);
  border: none;
  font-size: 1em;
  width: 100%;
  margin: 16px 0;
  outline: none;
  resize: none;
}

</style>
