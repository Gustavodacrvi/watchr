<template>
  <div class="Heading"
    :name='header.name'
    :id='header.id'
  >
    <transition name="fade" mode="out-in">
      <div v-if="!editing">
        <div class="header-wrapper handle" key="wr"
          @click="showing = !showing"
          @dblclick="toggleEditing"
          @mouseenter="onHover = true"
          @mouseleave="onHover = false"
        >
          <div class="header">
            <span :style="{color}">
              <Icon v-if="hasProgress" class="icon"
                icon="tasks"
                color='var(--primary)'
                :progress="progress"
                width='15px'
              />
              <Icon v-else-if="icon" class="icon"
                :icon='icon'
                color='var(--primary)'
                width='22px'
              />
              <h3 class="name" :class="{hasIcon}">{{ name }}</h3>
            </span>
            <div class="icons" @click.stop>
              <IconDrop class="icon"
                handle='settings-h'
                :circle='true'
                :options='options'
                :hideHandle='!showOptions'
                @edit='toggleEditing'
              />
            </div>
          </div>
        </div>
        <NotesApp :notes="notes" @save-notes="saveNote"/>
        <transition name="fade-t">
          <div v-show="showing && !movingHeading" class="cont">
            <slot></slot>
          </div>
        </transition>
      </div>
      <div v-else key="edig">
        <EditHeading
          :name='name'
          :errorToast='headingEdit.errorToast'
          :names='headingEdit.excludeNames'
          :buttonTxt='l["Save"]'
          @save='save'
          @cancel='toggleEditing'
        />
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop/IconDrop.vue'
import IconVue from '../../Icon.vue'
import EditVue from './Edit.vue'
import Notes from './Notes.vue'

import { mapGetters } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['name', 'options', 'color', 'header', 'allowEdit', 'headingEdit', 'save', 'notes', 'movingHeading', 'progress', 'icon'],
  components: {
    IconDrop: IconDropVue,
    Icon: IconVue,
    EditHeading: EditVue,
    NotesApp: Notes,
  },
  mounted() {
    const header = this.$el.getElementsByClassName('header')[0]
    if (header)
      utils.bindOptionsToEventListener(header, this.options, this)
  },
  data() {
    return {
      showing: true,
      onHover: false,
      editing: false,
    }
  },
  methods: {
    toggleEditing() {
      if (this.allowEdit)
        this.editing = !this.editing
    },
    saveNote(notes) {
      this.$emit('save-notes', notes)
    },
  },
  computed: {
    ...mapGetters(['l']),
    showOptions() {
      return this.showIconDrop && this.options && this.options.length > 0
    },
    showIconDrop() {
      const isDesktop = this.$store.getters.isDesktop
      if (isDesktop && this.onHover) return true
      else if (!isDesktop) return true
      return false
    },
    hasProgress() {
      return this.progress !== null && this.progress !== undefined
    },
    hasIcon() {
      return this.hasProgress || this.icon
    },
  }
}

</script>

<style scoped>

.icons {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-left: 8px;
}

.IconDrop {
  transform: translateY(5px);
}

.Heading {
  margin: 24px 0;
  position: relative;
  z-index: 1;
}

.Heading:hover {
  z-index: 2;
}

.header-wrapper {
  padding: 0 6px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  height: 45px;
  z-index: 50;
  position: relative;
}

.cont {
  position: relative;
  z-index: 49;
}

.icon {
  transform: translate(-5px, 3px);
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  display: inline-block;
  margin: 0;
  color: var(--primary);
}

.name.hasIcon {
  transform: translateX(8px);
}

</style>
