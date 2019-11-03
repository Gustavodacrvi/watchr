<template>
  <div class="Header" @click='click'>
    <div v-if="$store.getters.isDesktop" class="header">
      <Icon class="icon"
        :icon="getIcon"
        :color="getIconColor"
        :progress='progress'
        width="40px"
      />
      <h2 v-if="!editing || !isEditable"
        class="name"
        @click.stop="editing = true"
      >{{ viewNameValue }}</h2>
      <input v-else-if="isEditable"
        class="input"
        autocomplete="off"
        :value="title"
        @input='v => title = v.target.value'
        ref='input'
        @click.stop
        @keydown="keydown"
      >
      <transition name="line-t"
        @enter="lineEnter"
        @leave="lineLeave"
      >
        <div v-if="isEditable && editing" class="line"></div>
      </transition>
      <IconDrop class="passive drop" handle="settings-h" handleColor="var(--gray)" :options="options"/>
    </div>
    <transition name="note-t"
      @enter='enterNote'
      @leave='leaveNote'
    >
      <div v-if="notes && !editingNote" class="tags saved-notes" @click.stop="editingNote = true" :class="platform">
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
    <div class="tags" :class="{margins: tags.length > 0}">
      <Tag class="tag" v-for="t in tags" :key="t.id"
        :value="t.name"
        :selected='activeTags.includes(t.name)'
        icon="tag"
        @click="$emit('tag', t.name)"
      />
    </div>
    <div class="tags" :class="{margins: lists.length > 0}">
      <Tag class="tag" v-for="l in lists" :key="l.id"
        :value="l.name"
        :selected='activeList === l.name'
        icon="tasks"
        @click="$emit('list', l.name)"
      />
    </div>
  </div>
</template>

<script>

import IconVue from '../../Icon.vue'
import IconDropVue from '../../IconDrop.vue'
import TagVue from './../Tag.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['viewName', 'viewNameValue', 'options', 'tags', 'lists', 'activeTags', 'activeList', 'icon', 'viewType', 'isSmart', 'notes', 'progress'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  data() {
    return {
      editing: false,
      editingNote: false,
      title: this.viewNameValue,
      note: this.notes,
    }
  },
  created() {
    this.pushToNavbar()
    window.addEventListener('click', this.hide)
  },
  mounted() {
    this.fixHeight()
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    fixHeight() {
      setTimeout(() => {
        const el =this.$refs.notes
        el.style.height = '5px'
        el.style.height = (el.scrollHeight) + 'px'
      })
    },
    lineEnter(el) {
      const s = el.style
      
      const inp = this.$refs.input
      if (inp) {
        s.left = inp.offsetLeft + 'px'
        s.opacity = '0'
        s.width = '0px'
        s.transitionDuration = '.0s'
        setTimeout(() => {
          s.transitionDuration = '.2s'
          s.width = inp.offsetWidth + 'px'
          s.opacity = '1'
        })
      }
    },
    lineLeave(el) {
      el.style.width = '0px'
      el.style.opacity = '0'
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
    leaveNote(el) {
      const s = el.style
      s.transitionDuration = '.2s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.opacity = '0'
    },
    keydown({key}) {
      if (key === "Enter" && this.isEditable) {
        this.$emit('save-header-name', this.title.trim())
        this.editing = false
      }
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
    click(event) {
      if (this.selectedTasks.length > 0) event.stopPropagation()
    },
    pushToNavbar() {
      this.$store.commit('pushNavBarData', {
        options: this.options,
        title: this.viewNameValue,
      })
    },
    focusOnInput() {
      setTimeout(() => {
        const inp = this.$refs.input
        if (inp) inp.focus()
      }, 100) 
    },
    focusOnNotes() {
      setTimeout(() => {
        const el = this.$refs.notes
        if (el) el.focus()
      }, 100)
    },
  },
  computed: {
    ...mapState(['selectedTasks']),
    ...mapGetters(['isDesktop', 'platform']),
    isEditable() {
      return !this.isSmart && (this.viewType === 'list' || this.viewType === 'tag') && this.isDesktop
    },
    getIcon() {
      if (this.icon) return this.icon
      if (this.viewType === 'search') return 'search'
      const obj = {
        Today: 'star',
        Tomorrow: 'sun',
        Inbox: 'inbox',
        Upcoming: 'calendar',
        Completed: 'circle-check',
      }
      return obj[this.viewName]
    },
    getIconColor() {
      if (this.viewType === 'list') {
        const obj = {
          Today: 'var(--yellow)',
          Tomorrow: 'var(--orange)',
          Inbox: 'var(--primary)',
          Upcoming: 'var(--green)',
          Completed: 'var(--brown)',
        }
        const color = obj[this.viewName]
        if (!color) return 'var(--purple)'
        return color
      }
      if (this.viewType === 'search') return ''
      return 'var(--red)'
    },
  },
  watch: {
    viewName() {
      this.pushToNavbar()
      this.editing = false
    },
    viewNameValue() {
      this.title = this.viewNameValue
      this.note = this.notes
    },
    notes() {
      this.note
    },
    options() {
      this.pushToNavbar()
    },
    editing() {
      if (this.editing)
        this.focusOnInput()
    },
    editingNote() {
      this.fixHeight()
      if (this.editingNote)
        this.focusOnNotes()
    }
  }
}

</script>

<style scoped>

.Header {
  position: relative;
  z-index: 200;
}

.header, .tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  margin: 0;
  transition-duration: .2s;
}

.saved-notes.mobile {
  margin: 0 12px;
}

.input {
  background-color: var(--back-color);
  border: none;
  font-size: 1.5em;
  width: 500px;
  font-weight: bold;
  outline: none;
}

.line {
  position: absolute;
  bottom: 0;
  display: inline-block;
  height: 2px;
  background-color: var(--white);
}

.notes {
  background-color: var(--back-color);
  border: none;
  font-size: 1em;
  width: 100%;
  margin: 16px 0;
  outline: none;
}

.header {
  z-index: 200;
}

.tags {
  z-index: 199;
}

.tag {
  margin-top: 4px;
}

.margins {
  margin-top: 30px;
}

.margins + .margins {
  margin-top: 4px;
}

.drop {
  transform: translateY(6px);
}

.IconDrop {
  position: absolute;
  right: 0;
}

.icon {
  margin-right: 16px;
}

.name {
  margin: 0;
  max-width: 550px;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
